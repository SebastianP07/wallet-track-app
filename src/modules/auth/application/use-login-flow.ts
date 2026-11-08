import { useCallback, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";

import type { AuthRepository } from "./auth-repository";
import type { PasskeyAuthenticator } from "./passkey-authenticator";
import type { PasswordLoginRequest } from "../domain/types";
import { describeAuthFailure, type AuthOperation } from "../domain/auth-failure";
import { stageAfterPassword, type LoginStage } from "../domain/login-flow";
import { PasskeyCeremonyError } from "../domain/passkey-failure";
import { ApiError } from "@/shared/api/http-client";
import { useMessages, type Translatable } from "@/shared/i18n/use-i18n";

type Command =
  | { operation: "password"; credentials: PasswordLoginRequest }
  | { operation: "passkey" }
  | { operation: Exclude<AuthOperation, "password" | "passkey" | "logout">; value: string };

type Outcome = LoginStage | { name: "authenticated" };

async function execute(
  command: Command,
  repository: AuthRepository,
  authenticator: PasskeyAuthenticator,
): Promise<Outcome> {
  switch (command.operation) {
    case "password":
      return stageAfterPassword(await repository.loginWithPassword(command.credentials));
    case "passkey": {
      const options = await repository.startPasskeyLogin();
      const credential = await authenticator.get(options);
      await repository.loginWithPasskey(credential);
      return { name: "authenticated" };
    }
    case "totp":
      await repository.loginWithTotp(command.value);
      return { name: "authenticated" };
    case "recovery-code":
      await repository.loginWithRecoveryCode(command.value);
      return { name: "authenticated" };
    case "enrollment-secret":
      return {
        name: "enrollment-confirm",
        enrollment: await repository.startMfaEnrollment(command.value),
      };
    case "enrollment-confirm": {
      const { recoveryCodes } = await repository.confirmMfaEnrollment(command.value);
      return { name: "recovery-codes", codes: recoveryCodes };
    }
  }
}

export interface LoginFailure {
  message: string;
}

export function useLoginFlow(
  repository: AuthRepository,
  authenticator: PasskeyAuthenticator,
  onAuthenticated: () => void,
) {
  const [stage, setStage] = useState<LoginStage>({ name: "password" });
  const messages = useMessages();
  // Kept as what to say rather than the words, so a language switch rewords a failure on screen.
  const [failureText, setFailureText] = useState<{ describe: Translatable } | null>(null);
  const setFailure = (describe: Translatable | null) => setFailureText(describe ? { describe } : null);
  const [passkeyAvailable, setPasskeyAvailable] = useState(false);

  const fallBackToCode = (describe: Translatable) => {
    setPasskeyAvailable(false);
    setFailure(describe);
    setStage({ name: "totp" });
  };

  const { mutate, isPending } = useMutation({
    mutationFn: (command: Command) => execute(command, repository, authenticator),
    onMutate: () => setFailure(null),
    onSuccess: (outcome) => {
      if (outcome.name === "authenticated") {
        onAuthenticated();
      } else if (outcome.name === "passkey" && !authenticator.isSupported()) {
        fallBackToCode((t) => t.auth.failures.passkeysUnsupported);
      } else {
        setPasskeyAvailable(outcome.name === "passkey");
        setStage(outcome);
      }
    },
    onError: (error, command) => {
      if (error instanceof PasskeyCeremonyError) {
        const { kind } = error;
        if (kind === "unsupported") {
          fallBackToCode((t) => t.auth.failures.passkeysUnsupported);
        } else {
          setFailure((t) => t.auth.failures.ceremony[kind]);
        }
        return;
      }
      const status = error instanceof ApiError ? error.status : 0;
      if (command.operation === "passkey" && status === 409) {
        fallBackToCode((t) => t.auth.failures.noPasskeyLeft);
        return;
      }
      const retryAfter = error instanceof ApiError ? error.retryAfterSeconds : null;
      setFailure((t) => describeAuthFailure(command.operation, status, retryAfter, t));
      if (status === 409) {
        setStage({ name: "password" });
      }
    },
  });

  const goTo = useCallback((next: LoginStage) => {
    setFailureText(null);
    setStage(next);
  }, []);

  const clearFailure = useCallback(() => setFailureText(null), []);
  const failure = useMemo<LoginFailure | null>(
    () => (failureText ? { message: failureText.describe(messages) } : null),
    [failureText, messages],
  );

  return { stage, failure, isPending, passkeyAvailable, submit: mutate, goTo, clearFailure };
}
