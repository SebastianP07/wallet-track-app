import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { PeriodsRepository } from "./periods-repository";
import { describePeriodFailure } from "../domain/failures";
import { withPeriod } from "../domain/period-list";
import type { Period, PeriodList } from "../domain/types";
import { statusOf } from "@/shared/api/http-client";
import { PERIODS_KEY } from "@/shared/api/query-keys";
import { notify } from "@/shared/feedback/toast-store";
import { useMessages, type Translatable } from "@/shared/i18n/use-i18n";

// The month's opening balance waits for the server like opening and closing do: the expected close and the
// mismatch come back with the Dashboard, which every write refreshes.
export function useOpeningBalance(repository: PeriodsRepository, period: string, onSessionEnded: () => void) {
  const queryClient = useQueryClient();
  const messages = useMessages();
  const [failure, setFailure] = useState<Translatable | null>(null);

  const mutation = useMutation({
    mutationFn: (openingBalance: number | null) => repository.setOpeningBalance(period, openingBalance),
    onMutate: () => setFailure(null),
    onSuccess: (updated: Period, openingBalance) => {
      queryClient.setQueryData<PeriodList>(PERIODS_KEY, (list) => list && withPeriod(list, updated));
      notify.success(
        openingBalance === null ? messages.feedback.openingBalanceCleared : messages.feedback.openingBalanceSaved,
      );
    },
    onError: (error: unknown) => {
      if (statusOf(error) === 401) {
        onSessionEnded();
        return;
      }
      const status = statusOf(error);
      const describe = (current: typeof messages) =>
        status === 400 ? current.periods.failures.openingBalanceRejected : describePeriodFailure(status, current);
      setFailure(() => describe);
      notify.error(describe(messages));
    },
  });

  return {
    setOpeningBalance: (openingBalance: number | null) => mutation.mutate(openingBalance),
    isSaving: mutation.isPending,
    failure: failure?.(messages) ?? null,
  };
}
