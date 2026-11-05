import { useState } from "react";

import type { ExpensesRepository } from "./expenses-repository";
import { monthItemsKey, monthItemsListKey } from "./use-expense-list";
import { describeExpenseFailure } from "../domain/failures";
import type { ItemCreate, PeriodItem, PeriodItemList, PeriodItemUpdate } from "../domain/types";
import { statusOf } from "@/shared/api/http-client";
import { pendingRowId, withoutRow, withReplacedRow, withRow } from "@/shared/query/optimistic-rows";
import { useOptimisticMutation } from "@/shared/query/use-optimistic-mutation";

interface ItemMutationOptions {
  repository: ExpensesRepository;
  period: string;
  tagId: string | null;
  isClosed: boolean;
  onSessionEnded: () => void;
}

// Every writable kind of item changes the one cached month list, whichever section it is shown in.
export function useItemMutations({
  repository,
  period,
  tagId,
  isClosed,
  onSessionEnded,
}: ItemMutationOptions) {
  const [failure, setFailure] = useState<string | null>(null);

  const keys = { queryKey: monthItemsListKey(period, tagId), syncKey: monthItemsKey(period) };
  const onStart = () => setFailure(null);
  const onFailure = (error: unknown) => {
    if (statusOf(error) === 401) {
      onSessionEnded();
      return;
    }
    setFailure(describeExpenseFailure(statusOf(error)));
  };

  const create = useOptimisticMutation<PeriodItemList, ItemCreate, PeriodItem>({
    ...keys,
    mutationFn: (item) => repository.create(period, item),
    change: (list, item) => {
      const now = new Date().toISOString();
      const pending: PeriodItem = {
        id: pendingRowId(),
        period,
        dueDate: null,
        ...item,
        tagId: item.tagId ?? null,
        templateId: null,
        personId: null,
        cardId: item.kind === "card_charge" ? item.cardId : null,
        status: "pending",
        doneAt: null,
        urgency: "none",
        createdAt: now,
        updatedAt: now,
      };
      return {
        next: withRow(list, pending),
        undo: (current) => withoutRow(current, pending.id),
        confirm: (current, created) => withReplacedRow(current, pending.id, created),
      };
    },
    onStart,
    onFailure,
  });

  const update = useOptimisticMutation<PeriodItemList, { id: string; changes: PeriodItemUpdate }, PeriodItem>({
    ...keys,
    mutationFn: ({ id, changes }) => repository.update(id, changes),
    change: (list, { id, changes }) => {
      const previous = list.items.find((item) => item.id === id);
      if (!previous) {
        return { next: list, undo: (current) => current };
      }
      return {
        next: withReplacedRow(list, id, { ...previous, ...changes }),
        undo: (current) => withReplacedRow(current, id, previous),
        confirm: (current, updated) => withReplacedRow(current, id, updated),
      };
    },
    onStart,
    onFailure,
  });

  const remove = useOptimisticMutation<PeriodItemList, string, void>({
    ...keys,
    mutationFn: (id) => repository.remove(id),
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
    onStart,
    onFailure,
  });

  const toggleDone = useOptimisticMutation<PeriodItemList, { id: string; done: boolean }, PeriodItem>({
    ...keys,
    // A quick tap and undo have to land in the order they were made.
    scope: "period-item-done",
    mutationFn: ({ id, done }) => (done ? repository.markDone(id) : repository.unmarkDone(id)),
    change: (list, { id, done }) => {
      const previous = list.items.find((item) => item.id === id);
      if (!previous) {
        return { next: list, undo: (current) => current };
      }
      // A card charge never becomes overdue (D3), whatever its month.
      const undone = isClosed && previous.kind !== "card_charge" ? ("overdue" as const) : ("pending" as const);
      const next: PeriodItem = done
        ? { ...previous, status: "done", doneAt: new Date().toISOString() }
        : { ...previous, status: undone, doneAt: null };
      return {
        next: withReplacedRow(list, id, next),
        undo: (current) => withReplacedRow(current, id, previous),
        confirm: (current, updated) => withReplacedRow(current, id, updated),
      };
    },
    onStart,
    onFailure,
  });

  return {
    failure,
    isCreating: create.isPending,
    createItem: create.mutate,
    updateItem: (id: string, changes: PeriodItemUpdate) => update.mutate({ id, changes }),
    deleteItem: (id: string) => remove.mutate(id),
    setDone: (id: string, done: boolean) => toggleDone.mutate({ id, done }),
  };
}
