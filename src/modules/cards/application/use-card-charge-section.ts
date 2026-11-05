import { useQuery } from "@tanstack/react-query";

import type { CardsRepository } from "./cards-repository";
import type { CardChargeDraft } from "../domain/card-forms";
import type { ExpensesRepository } from "@/modules/expenses/application/expenses-repository";
import { monthItemsKey, useExpenseList } from "@/modules/expenses/application/use-expense-list";
import { useItemMutations } from "@/modules/expenses/application/use-item-mutations";
import { statusOf } from "@/shared/api/http-client";

interface SectionOptions {
  repository: ExpensesRepository;
  cardsRepository: CardsRepository;
  period: string;
  tagId: string | null;
  isClosed: boolean;
  onSessionEnded: () => void;
}

export function useCardChargeSection({
  repository,
  cardsRepository,
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
  // Kept under the month's items, so every change to an item refreshes it with the list.
  const totalsQuery = useQuery({
    queryKey: [...monthItemsKey(period), "card-totals"],
    queryFn: () => cardsRepository.totals(period),
    retry: (count, error) => ![401, 404].includes(statusOf(error)) && count < 2,
    enabled: Boolean(list),
  });

  const totals = totalsQuery.data;
  return {
    ...itemList,
    ...mutations,
    items: list ? list.items.filter((item) => item.kind === "card_charge") : [],
    totals,
    totalsLoadFailed: totalsQuery.isError && !totals,
    reloadTotals: () => void totalsQuery.refetch(),
    totalsAreSettling: itemList.totalsAreSettling || totalsQuery.isFetching,
    createCharge: (draft: CardChargeDraft, callbacks: { onSuccess: () => void }) =>
      createItem({ kind: "card_charge", ...draft }, callbacks),
  };
}
