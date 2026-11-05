import { useEffect } from "react";
import { useIsMutating, useQuery } from "@tanstack/react-query";

import type { ExpensesRepository } from "./expenses-repository";
import { statusOf } from "@/shared/api/http-client";
import { PERIOD_ITEMS_KEY } from "@/shared/api/query-keys";

const NOT_FOUND = 404;

export const monthItemsKey = (period: string) => [...PERIOD_ITEMS_KEY, period];

export const monthItemsListKey = (period: string, tagId: string | null) => [
  ...monthItemsKey(period),
  "list",
  tagId,
];

// Both sections and the overview read this one query. A 404 is how a month with no period answers.
export function useExpenseList(
  repository: ExpensesRepository,
  period: string,
  tagId: string | null,
  onSessionEnded: () => void,
) {
  const query = useQuery({
    queryKey: monthItemsListKey(period, tagId),
    queryFn: () => repository.list(period, tagId),
    retry: (count, error) => ![401, NOT_FOUND].includes(statusOf(error)) && count < 2,
  });
  const inFlight = useIsMutating({ mutationKey: monthItemsKey(period) });

  const { error } = query;
  useEffect(() => {
    if (statusOf(error) === 401) {
      onSessionEnded();
    }
  }, [error, onSessionEnded]);

  const list = query.data;
  const notOpened = !list && statusOf(error) === NOT_FOUND;
  return {
    list,
    notOpened,
    isLoading: query.isPending,
    loadFailed: query.isError && !list && !notOpened,
    refreshFailed: query.isError && Boolean(list),
    // The rows are ahead of the totals until the refetch after a change brings them back in step.
    totalsAreSettling: inFlight > 0 || query.isFetching,
    reload: () => void query.refetch(),
  };
}
