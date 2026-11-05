import { useEffect } from "react";
import { useIsMutating, useQuery } from "@tanstack/react-query";

import type { DashboardRepository } from "./dashboard-repository";
import { statusOf } from "@/shared/api/http-client";
import { DASHBOARD_KEY } from "@/shared/api/query-keys";

const NOT_FOUND = 404;

// The KPIs and the charts read this one query. A 404 is how a month with no period answers.
export function useDashboard(
  repository: DashboardRepository,
  period: string,
  onSessionEnded: () => void,
) {
  const query = useQuery({
    queryKey: [...DASHBOARD_KEY, period],
    queryFn: () => repository.get(period),
    retry: (count, error) => ![401, NOT_FOUND].includes(statusOf(error)) && count < 2,
  });
  const inFlight = useIsMutating();

  const { error } = query;
  useEffect(() => {
    if (statusOf(error) === 401) {
      onSessionEnded();
    }
  }, [error, onSessionEnded]);

  const dashboard = query.data;
  const notOpened = !dashboard && statusOf(error) === NOT_FOUND;
  return {
    dashboard,
    notOpened,
    isLoading: query.isPending,
    loadFailed: query.isError && !dashboard && !notOpened,
    refreshFailed: query.isError && Boolean(dashboard),
    // These numbers lag every write until the refetch after it lands.
    isSettling: inFlight > 0 || query.isFetching,
    reload: () => void query.refetch(),
  };
}
