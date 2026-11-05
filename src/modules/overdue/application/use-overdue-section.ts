import { useEffect, useState } from "react";
import { useIsMutating, useQuery } from "@tanstack/react-query";

import type { OverdueRepository } from "./overdue-repository";
import { describeOverdueFailure } from "../domain/failures";
import { groupOverdue } from "../domain/overdue-groups";
import type { OverdueItemList } from "../domain/types";
import type { PeriodItem } from "@/modules/expenses/domain/types";
import { statusOf } from "@/shared/api/http-client";
import { OVERDUE_ITEMS_KEY, PERIOD_ITEMS_KEY } from "@/shared/api/query-keys";
import { withoutRow, withRow } from "@/shared/query/optimistic-rows";
import { useOptimisticMutation } from "@/shared/query/use-optimistic-mutation";

// Not scoped to a month: the list is the same whichever one is selected. The tag only narrows the rows;
// the totals cover the whole list, as a month's cover the whole month (D5).
export function useOverdueSection(
  repository: OverdueRepository,
  tagId: string | null,
  onSessionEnded: () => void,
) {
  const [failure, setFailure] = useState<string | null>(null);

  const query = useQuery({
    queryKey: OVERDUE_ITEMS_KEY,
    queryFn: () => repository.list(),
    retry: (count, error) => statusOf(error) !== 401 && count < 2,
  });
  const inFlight = useIsMutating({ mutationKey: OVERDUE_ITEMS_KEY });

  const { error } = query;
  useEffect(() => {
    if (statusOf(error) === 401) {
      onSessionEnded();
    }
  }, [error, onSessionEnded]);

  const settle = useOptimisticMutation<OverdueItemList, string, PeriodItem>({
    queryKey: OVERDUE_ITEMS_KEY,
    // The same queue as the months' toggles, so a settle and an undo land in the order they were made.
    scope: "period-item-done",
    // The item's own month, and with a person-linked item the people of every month its payment covers.
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
    onFailure: (cause) => {
      if (statusOf(cause) === 401) {
        onSessionEnded();
        return;
      }
      setFailure(describeOverdueFailure(statusOf(cause)));
    },
  });

  const list = query.data;
  const allItems = list?.items ?? [];
  const items = tagId ? allItems.filter((item) => item.tagId === tagId) : allItems;
  return {
    items,
    groups: groupOverdue(list, items),
    isLoading: query.isPending,
    loadFailed: query.isError && !list,
    refreshFailed: query.isError && Boolean(list),
    // The rows are ahead of the totals until the refetch after a change brings them back in step.
    totalsAreSettling: inFlight > 0 || query.isFetching,
    reload: () => void query.refetch(),
    failure,
    settle: (id: string) => settle.mutate(id),
  };
}
