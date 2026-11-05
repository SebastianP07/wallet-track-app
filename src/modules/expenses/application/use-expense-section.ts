import { useState } from "react";

import type { ExpensesRepository } from "./expenses-repository";
import { monthItemsKey, monthItemsListKey, useExpenseList } from "./use-expense-list";
import { itemsOf } from "../domain/expense-groups";
import { describeExpenseFailure } from "../domain/failures";
import type { ExpenseDraft } from "../domain/expense-forms";
import type { ExpenseKind, PeriodItem, PeriodItemList, PeriodItemUpdate } from "../domain/types";
import { statusOf } from "@/shared/api/http-client";
import { pendingRowId, withoutRow, withReplacedRow, withRow } from "@/shared/query/optimistic-rows";
import { useOptimisticMutation } from "@/shared/query/use-optimistic-mutation";

interface SectionOptions {
  repository: ExpensesRepository;
  period: string;
  kind: ExpenseKind;
  tagId: string | null;
  isClosed: boolean;
  onSessionEnded: () => void;
}

export function useExpenseSection({
  repository,
  period,
  kind,
  tagId,
  isClosed,
  onSessionEnded,
}: SectionOptions) {
  const [failure, setFailure] = useState<string | null>(null);
  const expenseList = useExpenseList(repository, period, tagId, onSessionEnded);

  const keys = { queryKey: monthItemsListKey(period, tagId), syncKey: monthItemsKey(period) };
  const onStart = () => setFailure(null);
  const onFailure = (error: unknown) => {
    if (statusOf(error) === 401) {
      onSessionEnded();
      return;
    }
    setFailure(describeExpenseFailure(statusOf(error)));
  };

  const create = useOptimisticMutation<PeriodItemList, ExpenseDraft, PeriodItem>({
    ...keys,
    mutationFn: (draft) => repository.create(period, { kind, ...draft }),
    change: (list, draft) => {
      const now = new Date().toISOString();
      const pending: PeriodItem = {
        id: pendingRowId(),
        period,
        kind,
        ...draft,
        templateId: null,
        personId: null,
        cardId: null,
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
      const undone = isClosed ? ("overdue" as const) : ("pending" as const);
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

  const { list } = expenseList;
  return {
    ...expenseList,
    items: itemsOf(list, kind),
    toPay: list ? list.totals[kind].pending : null,
    isCreating: create.isPending,
    failure,
    createExpense: create.mutate,
    updateExpense: (id: string, changes: PeriodItemUpdate) => update.mutate({ id, changes }),
    deleteExpense: (id: string) => remove.mutate(id),
    setDone: (id: string, done: boolean) => toggleDone.mutate({ id, done }),
  };
}
