import { useCallback, useState } from "react";
import { useMutation } from "@tanstack/react-query";

import type { AuthRepository } from "./auth-repository";
import type { PasskeyAuthenticator } from "./passkey-authenticator";
import type { PasswordLoginRequest } from "../domain/types";
import { describeAuthFailure, type AuthOperation } from "../domain/auth-failure";
import { stageAfterPassword, type LoginStage } from "../domain/login-flow";
import {
  describeCeremonyFailure,
  NO_PASSKEY_LEFT,
  PasskeyCeremonyError,
  PASSKEYS_UNSUPPORTED,
} from "../domain/passkey-failure";
import { ApiError } from "@/shared/api/http-client";

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
  const [failure, setFailure] = useState<LoginFailure | null>(null);
  const [passkeyAvailable, setPasskeyAvailable] = useState(false);

  const fallBackToCode = (message: string) => {
    setPasskeyAvailable(false);
    setFailure({ message });
    setStage({ name: "totp" });
  };

  const { mutate, isPending } = useMutation({
    mutationFn: (command: Command) => execute(command, repository, authenticator),
    onMutate: () => setFailure(null),
    onSuccess: (outcome) => {
      if (outcome.name === "authenticated") {
        onAuthenticated();
      } else if (outcome.name === "passkey" && !authenticator.isSupported()) {
        fallBackToCode(PASSKEYS_UNSUPPORTED);
      } else {
        setPasskeyAvailable(outcome.name === "passkey");
        setStage(outcome);
      }
    },
    onError: (error, command) => {
      if (error instanceof PasskeyCeremonyError) {
        if (error.kind === "unsupported") {
          fallBackToCode(PASSKEYS_UNSUPPORTED);
        } else {
          setFailure({ message: describeCeremonyFailure(error.kind) });
        }
        return;
      }
      const status = error instanceof ApiError ? error.status : 0;
      if (command.operation === "passkey" && status === 409) {
        fallBackToCode(NO_PASSKEY_LEFT);
        return;
      }
      const retryAfter = error instanceof ApiError ? error.retryAfterSeconds : null;
      setFailure({ message: describeAuthFailure(command.operation, status, retryAfter) });
      if (status === 409) {
        setStage({ name: "password" });
      }
    },
  });

  const goTo = useCallback((next: LoginStage) => {
    setFailure(null);
    setStage(next);
  }, []);

  const clearFailure = useCallback(() => setFailure(null), []);

  return { stage, failure, isPending, passkeyAvailable, submit: mutate, goTo, clearFailure };
}
