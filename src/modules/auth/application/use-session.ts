import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import type { AuthRepository } from "./auth-repository";
import type { User } from "../domain/types";
import { describeAuthFailure } from "../domain/auth-failure";
import { ApiError } from "@/shared/api/http-client";
import { settled } from "@/shared/feedback/action-error";
import { notify } from "@/shared/feedback/toast-store";
import { useMessages, type Translatable } from "@/shared/i18n/use-i18n";

const isUnauthorized = (error: unknown) => error instanceof ApiError && error.status === 401;

// Revalidates on focus and reconnect, so logging out everywhere reaches the other open tabs.
export function useSession(
  repository: AuthRepository,
  initialUser: User,
  onSessionEnded: () => void,
) {
  const messages = useMessages();
  const [logoutFailure, setLogoutFailure] = useState<Translatable | null>(null);

  const { data: user = initialUser, error } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => repository.getCurrentUser(),
    initialData: initialUser,
    initialDataUpdatedAt: 0,
    refetchOnMount: false,
    retry: (count, queryError) => !isUnauthorized(queryError) && count < 2,
  });

  useEffect(() => {
    if (isUnauthorized(error)) {
      onSessionEnded();
    }
  }, [error, onSessionEnded]);

  const describe = (mutationError: unknown) => {
    const status = mutationError instanceof ApiError ? mutationError.status : 0;
    const retryAfter = mutationError instanceof ApiError ? mutationError.retryAfterSeconds : null;
    return describeAuthFailure("logout", status, retryAfter, messages);
  };

  const { mutate, mutateAsync, isPending } = useMutation({
    meta: { keepsDashboard: true },
    mutationFn: (scope: "this-device" | "all-devices") =>
      scope === "all-devices" ? repository.logoutAll() : repository.logout(),
    onMutate: () => setLogoutFailure(null),
    onSuccess: onSessionEnded,
    onError: (mutationError) => {
      if (isUnauthorized(mutationError)) {
        onSessionEnded();
        return;
      }
      const status = mutationError instanceof ApiError ? mutationError.status : 0;
      const retryAfter = mutationError instanceof ApiError ? mutationError.retryAfterSeconds : null;
      setLogoutFailure(() => (t: typeof messages) => describeAuthFailure("logout", status, retryAfter, t));
      notify.error(describe(mutationError));
    },
  });

  return {
    user,
    logOut: () => mutate("this-device"),
    // Asked first, then waited on: it ends every session, this one included.
    logOutEverywhere: () => settled(mutateAsync("all-devices"), describe),
    isLoggingOut: isPending,
    logoutFailure: logoutFailure?.(messages) ?? null,
  };
}
