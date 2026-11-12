import { useEffect, useState, useSyncExternalStore } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { PasskeyAuthenticator } from "./passkey-authenticator";
import type { SecurityRepository } from "./security-repository";
import { PasskeyCeremonyError } from "../domain/passkey-failure";
import {
  describeProofFailure,
  describeRegistrationFailure,
  describeRenameFailure,
} from "../domain/security-display";
import type { SecondFactorProof } from "../domain/types";
import { ApiError, statusOf } from "@/shared/api/http-client";
import { notify } from "@/shared/feedback/toast-store";
import { useMessages, type Translatable } from "@/shared/i18n/use-i18n";

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
  const messages = useMessages();
  const [failure, setFailureState] = useState<Translatable | null>(null);
  const setFailure = (describe: Translatable | null) => {
    setFailureState(() => describe);
    if (describe) {
      notify.error(describe(messages));
    }
  };
  const isSupported = useSyncExternalStore(subscribeToNothing, authenticator.isSupported, () => true);

  const query = useQuery({ queryKey: PASSKEYS_KEY, queryFn: () => repository.listPasskeys() });

  useEffect(() => {
    if (statusOf(query.error) === 401) {
      onSessionEnded();
    }
  }, [query.error, onSessionEnded]);

  const refresh = () => queryClient.invalidateQueries({ queryKey: PASSKEYS_KEY });

  // A rejected code and an ended session both answer 401, and only asking again tells them apart.
  const reportUnlessSessionEnded = async (error: unknown, describe: Translatable) => {
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
    setFailure(describe);
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
    failure: failure?.(messages) ?? null,
    isAdding: add.isPending,
    isRenaming: rename.isPending,
    isRemoving: remove.isPending,
    addPasskey: (name: string, proof: SecondFactorProof, callbacks: Callbacks) =>
      add.mutate(
        { name, proof },
        {
          onSuccess: () => {
            notify.success(messages.feedback.added(name));
            callbacks.onSuccess();
          },
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
          onSuccess: () => {
            notify.success(messages.feedback.saved(name));
            callbacks.onSuccess();
          },
          onError: (error) => {
            if (statusOf(error) === 401) {
              onSessionEnded();
              return;
            }
            const status = statusOf(error);
            setFailure((t) => describeRenameFailure(status, t));
          },
        },
      ),
    removePasskey: (id: string, proof: SecondFactorProof, callbacks: Callbacks) =>
      remove.mutate(
        { id, proof },
        {
          onSuccess: () => {
            const removed = query.data?.find((passkey) => passkey.id === id)?.name ?? "";
            notify.success(messages.feedback.deleted(removed));
            callbacks.onSuccess();
          },
          onError: (error) => {
            callbacks.onFailure();
            void reportUnlessSessionEnded(error, (t) =>
              describeProofFailure(statusOf(error), retryAfterOf(error), t),
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
  report: (error: unknown, describe: Translatable) => Promise<void>,
  setFailure: (describe: Translatable) => void,
) {
  if (!(error instanceof ProofSpentError)) {
    await report(error, (t) => describeProofFailure(statusOf(error), retryAfterOf(error), t));
    return;
  }
  const { reason } = error;
  if (reason instanceof PasskeyCeremonyError) {
    const { kind } = reason;
    setFailure((t) => t.security.failures.registrationCeremony[kind]);
    return;
  }
  await report(reason, (t) => describeRegistrationFailure(statusOf(reason), retryAfterOf(reason), t));
}
