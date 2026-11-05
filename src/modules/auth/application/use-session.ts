import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import type { AuthRepository } from "./auth-repository";
import type { User } from "../domain/types";
import { describeAuthFailure } from "../domain/auth-failure";
import { ApiError } from "@/shared/api/http-client";

const isUnauthorized = (error: unknown) => error instanceof ApiError && error.status === 401;

// Revalidates on focus and reconnect, so logging out everywhere reaches the other open tabs.
export function useSession(
  repository: AuthRepository,
  initialUser: User,
  onSessionEnded: () => void,
) {
  const [logoutFailure, setLogoutFailure] = useState<string | null>(null);

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

  const { mutate: logOut, isPending } = useMutation({
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
      setLogoutFailure(describeAuthFailure("logout", status, retryAfter));
    },
  });

  return { user, logOut, isLoggingOut: isPending, logoutFailure };
}
