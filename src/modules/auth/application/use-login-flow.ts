import { useCallback, useState } from "react";
import { useMutation } from "@tanstack/react-query";

import type { AuthRepository } from "./auth-repository";
import type { PasswordLoginRequest } from "../domain/types";
import { describeAuthFailure, type AuthOperation } from "../domain/auth-failure";
import { stageAfterPassword, type LoginStage } from "../domain/login-flow";
import { ApiError } from "@/shared/api/http-client";

type Command =
  | { operation: "password"; credentials: PasswordLoginRequest }
  | { operation: Exclude<AuthOperation, "password" | "logout">; value: string };

type Outcome = LoginStage | { name: "authenticated" };

async function execute(command: Command, repository: AuthRepository): Promise<Outcome> {
  switch (command.operation) {
    case "password":
      return stageAfterPassword(await repository.loginWithPassword(command.credentials));
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

export function useLoginFlow(repository: AuthRepository, onAuthenticated: () => void) {
  const [stage, setStage] = useState<LoginStage>({ name: "password" });
  const [failure, setFailure] = useState<LoginFailure | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: (command: Command) => execute(command, repository),
    onMutate: () => setFailure(null),
    onSuccess: (outcome) => {
      if (outcome.name === "authenticated") {
        onAuthenticated();
      } else {
        setStage(outcome);
      }
    },
    onError: (error, command) => {
      const status = error instanceof ApiError ? error.status : 0;
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

  return { stage, failure, isPending, submit: mutate, goTo, clearFailure };
}
