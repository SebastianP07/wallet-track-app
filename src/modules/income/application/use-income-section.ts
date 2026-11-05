import type { IncomeDraft } from "../domain/income-forms";
import type { ExpensesRepository } from "@/modules/expenses/application/expenses-repository";
import { useExpenseList } from "@/modules/expenses/application/use-expense-list";
import { useItemMutations } from "@/modules/expenses/application/use-item-mutations";

interface SectionOptions {
  repository: ExpensesRepository;
  period: string;
  tagId: string | null;
  isClosed: boolean;
  onSessionEnded: () => void;
}

export function useIncomeSection({
  repository,
  period,
  tagId,
  isClosed,
  onSessionEnded,
}: SectionOptions) {
  const itemList = useExpenseList(repository, period, tagId, onSessionEnded);
  const { createItem, ...mutations } = useItemMutations({
    repository,
    period,
    tagId,
    isClosed,
    onSessionEnded,
  });

  const { list } = itemList;
  return {
    ...itemList,
    ...mutations,
    items: list ? list.items.filter((item) => item.kind === "income") : [],
    toReceive: list ? list.totals.toReceive : null,
    createIncome: (draft: IncomeDraft, callbacks: { onSuccess: () => void }) =>
      createItem({ kind: "income", ...draft }, callbacks),
  };
}
