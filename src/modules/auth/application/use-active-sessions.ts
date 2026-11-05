import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { SecurityRepository } from "./security-repository";
import { describeRevokeFailure } from "../domain/security-display";
import type { ActiveSession } from "../domain/types";
import { statusOf } from "@/shared/api/http-client";

const SESSIONS_KEY = ["auth", "sessions"];

export function useActiveSessions(repository: SecurityRepository, onSessionEnded: () => void) {
  const queryClient = useQueryClient();
  const [failure, setFailure] = useState<string | null>(null);

  const query = useQuery({ queryKey: SESSIONS_KEY, queryFn: () => repository.listSessions() });

  useEffect(() => {
    if (statusOf(query.error) === 401) {
      onSessionEnded();
    }
  }, [query.error, onSessionEnded]);

  const revoke = useMutation({
    meta: { keepsDashboard: true },
    mutationFn: ({ id }: ActiveSession) => repository.revokeSession(id),
    onMutate: () => setFailure(null),
    onSuccess: (_result, session) => {
      if (session.current) {
        onSessionEnded();
      }
    },
    onError: (error) => {
      if (statusOf(error) === 401) {
        onSessionEnded();
        return;
      }
      setFailure(describeRevokeFailure(statusOf(error)));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: SESSIONS_KEY }),
  });

  return {
    sessions: query.data ?? [],
    isLoading: query.isPending,
    loadFailed: query.isError && query.data === undefined,
    refreshFailed: query.isError && query.data !== undefined,
    reload: () => query.refetch(),
    failure,
    isRevoking: revoke.isPending,
    revokeSession: revoke.mutate,
  };
}
