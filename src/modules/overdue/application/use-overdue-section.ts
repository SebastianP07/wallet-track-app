import { useEffect, useState } from "react";
import { useIsMutating, useQuery } from "@tanstack/react-query";

import type { OverdueRepository } from "./overdue-repository";
import { describeOverdueFailure } from "../domain/failures";
import { groupOverdue } from "../domain/overdue-groups";
import type { OverdueItemList } from "../domain/types";
import { doneWordOf } from "@/modules/expenses/domain/done-word";
import type { PeriodItem } from "@/modules/expenses/domain/types";
import { statusOf } from "@/shared/api/http-client";
import { OVERDUE_ITEMS_KEY, PERIOD_ITEMS_KEY } from "@/shared/api/query-keys";
import { settled } from "@/shared/feedback/action-error";
import { notify } from "@/shared/feedback/toast-store";
import { withoutRow, withRow } from "@/shared/query/optimistic-rows";
import { useOptimisticMutation } from "@/shared/query/use-optimistic-mutation";
import { useMessages, type Translatable } from "@/shared/i18n/use-i18n";

const NOT_FOUND = 404;

export const overdueItemsKey = (period: string) => [...OVERDUE_ITEMS_KEY, period];

// What the selected month owes from earlier months (D7), plus overdue income, which every month lists. A 404
// is how a month with no period answers. The tag only narrows the rows; the totals cover the whole list, as
// a month's cover the whole month (D5).
export function useOverdueSection(
  repository: OverdueRepository,
  period: string,
  tagId: string | null,
  onSessionEnded: () => void,
) {
  const messages = useMessages();
  const [failure, setFailure] = useState<Translatable | null>(null);
  const queryKey = overdueItemsKey(period);
  const describe = (cause: unknown) => describeOverdueFailure(statusOf(cause), messages);

  const query = useQuery({
    queryKey,
    queryFn: () => repository.list(period),
    retry: (count, error) => ![401, NOT_FOUND].includes(statusOf(error)) && count < 2,
  });
  const inFlight = useIsMutating({ mutationKey: queryKey });

  const { error } = query;
  useEffect(() => {
    if (statusOf(error) === 401) {
      onSessionEnded();
    }
  }, [error, onSessionEnded]);

  const settle = useOptimisticMutation<OverdueItemList, string, PeriodItem>({
    queryKey,
    // The same queue as the months' toggles, so a settle and an undo land in the order they were made.
    scope: "period-item-done",
    // This month's totals, the item's own month, and with a person-linked item the people of every month its
    // payment covers.
    refreshes: [PERIOD_ITEMS_KEY],
    mutationFn: (id) => repository.markDone(id),
    change: (list, id) => {
      const index = list.items.findIndex((item) => item.id === id);
      const previous = list.items[index];
      if (!previous) {
        return { next: list, undo: (current) => current };
      }
      return {
        next: withoutRow(list, id),
        undo: (current) => withRow(current, previous, Math.min(index, current.items.length)),
      };
    },
    onStart: () => setFailure(null),
    onSuccess: (settledItem) =>
      notify.success(messages.feedback.markedDone(settledItem.name, doneWordOf(settledItem.kind))),
    onFailure: (cause) => {
      if (statusOf(cause) === 401) {
        onSessionEnded();
        return;
      }
      const status = statusOf(cause);
      setFailure(() => (current: typeof messages) => describeOverdueFailure(status, current));
      notify.error(describe(cause));
    },
  });

  const list = query.data;
  const notOpened = !list && statusOf(error) === NOT_FOUND;
  const allItems = list?.items ?? [];
  const items = tagId ? allItems.filter((item) => item.tagId === tagId) : allItems;
  return {
    items,
    groups: groupOverdue(list, items),
    notOpened,
    isLoading: query.isPending,
    loadFailed: query.isError && !list && !notOpened,
    refreshFailed: query.isError && Boolean(list),
    // The rows are ahead of the totals until the refetch after a change brings them back in step.
    totalsAreSettling: inFlight > 0 || query.isFetching,
    reload: () => void query.refetch(),
    failure: failure?.(messages) ?? null,
    settle: (id: string) => settled(settle.mutateAsync(id), describe),
  };
}
