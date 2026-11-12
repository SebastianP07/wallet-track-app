import { useState } from "react";

import type { ExpensesRepository } from "./expenses-repository";
import { monthItemsKey, monthItemsListKey } from "./use-expense-list";
import { doneWordOf } from "../domain/done-word";
import { describeExpenseFailure } from "../domain/failures";
import { withKindOrder } from "../domain/item-order";
import type { ItemCreate, OrderedKind, PeriodItem, PeriodItemList, PeriodItemUpdate } from "../domain/types";
import { statusOf } from "@/shared/api/http-client";
import { OVERDUE_ITEMS_KEY, RECURRING_TEMPLATES_KEY } from "@/shared/api/query-keys";
import { settled } from "@/shared/feedback/action-error";
import { notify } from "@/shared/feedback/toast-store";
import { pendingRowId, withoutRow, withReplacedRow, withRow } from "@/shared/query/optimistic-rows";
import { useOptimisticMutation } from "@/shared/query/use-optimistic-mutation";
import { useMessages, type Translatable } from "@/shared/i18n/use-i18n";

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
  const messages = useMessages();
  const [failure, setFailure] = useState<Translatable | null>(null);

  const keys = {
    queryKey: monthItemsListKey(period, tagId),
    syncKey: monthItemsKey(period),
    // Toggling, editing or deleting an item of a closed month changes the overdue list of the month that owes it.
    // Adding an item that repeats, or deleting one to stop it, changes the templates.
    refreshes: [monthItemsKey(period), OVERDUE_ITEMS_KEY, RECURRING_TEMPLATES_KEY],
  };
  const t = messages.feedback;
  const describe = (error: unknown) => describeExpenseFailure(statusOf(error), messages);
  const nameIn = (list: PeriodItemList | undefined, id: string) =>
    list?.items.find((item) => item.id === id)?.name ?? "";
  const onStart = () => setFailure(null);
  const onFailure = (error: unknown) => {
    if (statusOf(error) === 401) {
      onSessionEnded();
      return;
    }
    const status = statusOf(error);
    setFailure(() => (current: typeof messages) => describeExpenseFailure(status, current));
    notify.error(describe(error));
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
        platformId: null,
        cardId: item.kind === "card_charge" ? item.cardId : null,
        status: "pending",
        doneAt: null,
        owedIn: null,
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
    onSuccess: (created) => notify.success(t.added(created.name)),
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
    onSuccess: (updated) => notify.success(t.saved(updated.name)),
    onFailure,
  });

  const remove = useOptimisticMutation<PeriodItemList, { id: string; stopRepeating: boolean }, void>({
    ...keys,
    mutationFn: ({ id, stopRepeating }) => repository.remove(id, stopRepeating),
    change: (list, { id }) => {
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
    onSuccess: (_result, { id }, before) => notify.success(t.deleted(nameIn(before, id))),
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
    onSuccess: (updated, { done }) => {
      const word = doneWordOf(updated.kind);
      notify.success(done ? t.markedDone(updated.name, word) : t.unmarkedDone(updated.name, word));
    },
    onFailure,
  });

  const reorder = useOptimisticMutation<PeriodItemList, { kind: OrderedKind; ids: string[] }, void>({
    ...keys,
    // Moves made one after another reach the server in that order, so the last one is what stays.
    scope: "period-item-order",
    mutationFn: ({ kind, ids }) => repository.reorder(period, kind, ids),
    change: (list, { kind, ids }) => {
      const previous = list.items.filter((item) => item.kind === kind).map((item) => item.id);
      return {
        next: withKindOrder(list, kind, ids),
        undo: (current) => withKindOrder(current, kind, previous),
      };
    },
    onStart,
    onSuccess: () => notify.success(t.orderSaved),
    onFailure,
  });

  return {
    failure: failure?.(messages) ?? null,
    isCreating: create.isPending,
    createItem: create.mutate,
    updateItem: (id: string, changes: PeriodItemUpdate) => update.mutate({ id, changes }),
    deleteItem: (id: string, stopRepeating = false) => remove.mutate({ id, stopRepeating }),
    setDone: (id: string, done: boolean) => settled(toggleDone.mutateAsync({ id, done }), describe),
    reorderItems: (kind: OrderedKind, ids: string[]) => reorder.mutate({ kind, ids }),
  };
}
