import { useMemo } from "react";

import type { ExpensesRepository } from "./expenses-repository";
import { useExpenseList } from "./use-expense-list";
import { useItemMutations } from "./use-item-mutations";
import { itemsOf } from "../domain/expense-groups";
import type { ExpenseDraft } from "../domain/expense-forms";
import type { ExpenseKind } from "../domain/types";

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
  const expenseList = useExpenseList(repository, period, tagId, onSessionEnded);
  const { createItem, updateItem, deleteItem, ...mutations } = useItemMutations({
    repository,
    period,
    tagId,
    isClosed,
    onSessionEnded,
  });

  const { list } = expenseList;
  // Kept while the list is the same, so a move can tell when the list it was made on has been replaced.
  const items = useMemo(() => itemsOf(list, kind), [list, kind]);
  return {
    ...expenseList,
    ...mutations,
    items,
    toPay: list ? list.totals[kind].pending : null,
    createExpense: (draft: ExpenseDraft, callbacks: { onSuccess: () => void }) =>
      createItem({ kind, ...draft }, callbacks),
    updateExpense: updateItem,
    deleteExpense: deleteItem,
  };
}
