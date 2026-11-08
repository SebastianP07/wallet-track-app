import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { PeriodsRepository } from "./periods-repository";
import { describePeriodFailure } from "../domain/failures";
import { findPeriod, withPeriod } from "../domain/period-list";
import type { Period, PeriodList } from "../domain/types";
import { statusOf } from "@/shared/api/http-client";
import { useMessages, type Translatable } from "@/shared/i18n/use-i18n";
import { PERIOD_ITEMS_KEY, PERIODS_KEY } from "@/shared/api/query-keys";


// Opening and closing wait for the server: what they do to a month's items is not something to
// show before it has happened. Every month reads the one list, so a month with no period is
// simply one the list does not have.
export function usePeriodStatus(
  repository: PeriodsRepository,
  period: string,
  onSessionEnded: () => void,
) {
  const queryClient = useQueryClient();
  const messages = useMessages();
  const [failure, setFailure] = useState<Translatable | null>(null);

  const query = useQuery({
    queryKey: PERIODS_KEY,
    queryFn: () => repository.list(),
    retry: (count, error) => statusOf(error) !== 401 && count < 2,
  });

  const { error: queryError } = query;
  useEffect(() => {
    if (statusOf(queryError) === 401) {
      onSessionEnded();
    }
  }, [queryError, onSessionEnded]);

  const mutationOptions = {
    onMutate: () => setFailure(null),
    onSuccess: (updated: Period) =>
      queryClient.setQueryData<PeriodList>(PERIODS_KEY, (list) => list && withPeriod(list, updated)),
    onError: (error: unknown) => {
      if (statusOf(error) === 401) {
        onSessionEnded();
        return;
      }
      const status = statusOf(error);
      setFailure(() => (current: typeof messages) => describePeriodFailure(status, current));
    },
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: PERIODS_KEY }),
        // Opening creates the month's items, and closing turns the pending ones overdue.
        queryClient.invalidateQueries({ queryKey: PERIOD_ITEMS_KEY }),
      ]),
  };
  const open = useMutation({ mutationFn: () => repository.open(period), ...mutationOptions });
  const close = useMutation({ mutationFn: () => repository.close(period), ...mutationOptions });

  return {
    selected: findPeriod(query.data, period),
    isLoading: query.isPending,
    loadFailed: query.isError && !query.data,
    failure: failure?.(messages) ?? null,
    reload: () => void query.refetch(),
    openMonth: () => open.mutate(),
    isOpening: open.isPending,
    closeMonth: () => close.mutate(),
    isClosing: close.isPending,
  };
}
