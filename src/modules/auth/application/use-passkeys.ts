import { useEffect, useState, useSyncExternalStore } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { PasskeyAuthenticator } from "./passkey-authenticator";
import type { SecurityRepository } from "./security-repository";
import { describeRegistrationCeremonyFailure, PasskeyCeremonyError } from "../domain/passkey-failure";
import {
  describeProofFailure,
  describeRegistrationFailure,
  describeRenameFailure,
} from "../domain/security-display";
import type { SecondFactorProof } from "../domain/types";
import { ApiError, statusOf } from "@/shared/api/http-client";

const PASSKEYS_KEY = ["auth", "passkeys"];
const SECURITY_META = { keepsDashboard: true };

const retryAfterOf = (error: unknown) => (error instanceof ApiError ? error.retryAfterSeconds : null);
const subscribeToNothing = () => () => {};

interface Callbacks {
  onSuccess: () => void;
  onFailure: () => void;
}

export function usePasskeys(
  repository: SecurityRepository,
  authenticator: PasskeyAuthenticator,
  onSessionEnded: () => void,
) {
  const queryClient = useQueryClient();
  const [failure, setFailure] = useState<string | null>(null);
  const isSupported = useSyncExternalStore(subscribeToNothing, authenticator.isSupported, () => true);

  const query = useQuery({ queryKey: PASSKEYS_KEY, queryFn: () => repository.listPasskeys() });

  useEffect(() => {
    if (statusOf(query.error) === 401) {
      onSessionEnded();
    }
  }, [query.error, onSessionEnded]);

  const refresh = () => queryClient.invalidateQueries({ queryKey: PASSKEYS_KEY });

  // A rejected code and an ended session both answer 401, and only asking again tells them apart.
  const reportUnlessSessionEnded = async (error: unknown, describe: () => string) => {
    if (statusOf(error) === 401) {
      try {
        await repository.listPasskeys();
      } catch (recheck) {
        if (statusOf(recheck) === 401) {
          onSessionEnded();
          return;
        }
      }
    }
    setFailure(describe());
  };

  const add = useMutation({
    meta: SECURITY_META,
    mutationFn: async ({ name, proof }: { name: string; proof: SecondFactorProof }) => {
      const options = await repository.startPasskeyRegistration(proof);
      let credential;
      try {
        credential = await authenticator.create(options);
      } catch (error) {
        throw new ProofSpentError(error);
      }
      try {
        return await repository.finishPasskeyRegistration(name, credential);
      } catch (error) {
        throw new ProofSpentError(error);
      }
    },
    onMutate: () => setFailure(null),
    onSettled: refresh,
  });

  const rename = useMutation({
    meta: SECURITY_META,
    mutationFn: ({ id, name }: { id: string; name: string }) => repository.renamePasskey(id, name),
    onMutate: () => setFailure(null),
    onSettled: refresh,
  });

  const remove = useMutation({
    meta: SECURITY_META,
    mutationFn: ({ id, proof }: { id: string; proof: SecondFactorProof }) =>
      repository.removePasskey(id, proof),
    onMutate: () => setFailure(null),
    onSettled: refresh,
  });

  return {
    passkeys: query.data ?? [],
    isLoading: query.isPending,
    loadFailed: query.isError && query.data === undefined,
    refreshFailed: query.isError && query.data !== undefined,
    reload: () => query.refetch(),
    isSupported,
    failure,
    isAdding: add.isPending,
    isRenaming: rename.isPending,
    isRemoving: remove.isPending,
    addPasskey: (name: string, proof: SecondFactorProof, callbacks: Callbacks) =>
      add.mutate(
        { name, proof },
        {
          onSuccess: callbacks.onSuccess,
          onError: (error) => {
            callbacks.onFailure();
            void reportAddFailure(error, reportUnlessSessionEnded, setFailure);
          },
        },
      ),
    renamePasskey: (id: string, name: string, callbacks: { onSuccess: () => void }) =>
      rename.mutate(
        { id, name },
        {
          onSuccess: callbacks.onSuccess,
          onError: (error) => {
            if (statusOf(error) === 401) {
              onSessionEnded();
              return;
            }
            setFailure(describeRenameFailure(statusOf(error)));
          },
        },
      ),
    removePasskey: (id: string, proof: SecondFactorProof, callbacks: Callbacks) =>
      remove.mutate(
        { id, proof },
        {
          onSuccess: callbacks.onSuccess,
          onError: (error) => {
            callbacks.onFailure();
            void reportUnlessSessionEnded(error, () =>
              describeProofFailure(statusOf(error), retryAfterOf(error)),
            );
          },
        },
      ),
  };
}

// Marks a failure after the proof was consumed, which changes what the owner has to do next.
class ProofSpentError extends Error {
  constructor(readonly reason: unknown) {
    super("Passkey registration failed after its proof was consumed");
    this.name = "ProofSpentError";
  }
}

async function reportAddFailure(
  error: unknown,
  report: (error: unknown, describe: () => string) => Promise<void>,
  setFailure: (message: string) => void,
) {
  if (!(error instanceof ProofSpentError)) {
    await report(error, () => describeProofFailure(statusOf(error), retryAfterOf(error)));
    return;
  }
  const { reason } = error;
  if (reason instanceof PasskeyCeremonyError) {
    setFailure(describeRegistrationCeremonyFailure(reason.kind));
    return;
  }
  await report(reason, () => describeRegistrationFailure(statusOf(reason), retryAfterOf(reason)));
}
