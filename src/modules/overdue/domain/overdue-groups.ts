import type { OverdueItemList } from "./types";
import type { ItemListCopy } from "@/modules/expenses/domain/expense-groups";
import type { PeriodItem } from "@/modules/expenses/domain/types";

export const OVERDUE_COPY: ItemListCopy = {
  empty: "Nothing overdue. Closed months left nothing unsettled.",
  filtered: "No overdue items with this tag.",
  loadFailed: "The overdue list could not be loaded.",
  refreshFailed: "Showing the overdue items last loaded; they could not be refreshed.",
};

const KIND_LABELS: Record<PeriodItem["kind"], string> = {
  fixed: "Fixed",
  occasional: "Occasional",
  income: "Income",
  card_charge: "Card charge",
};

export function kindLabel(item: PeriodItem): string {
  return KIND_LABELS[item.kind];
}

export interface OverdueGroup {
  id: "expenses" | "income";
  title: string;
  total: number;
  items: PeriodItem[];
}

// One group per total the backend gives (D1), each still oldest first. A group with no rows is left out.
export function groupOverdue(list: OverdueItemList | undefined, items: PeriodItem[]): OverdueGroup[] {
  if (!list) {
    return [];
  }
  const groups: OverdueGroup[] = [
    {
      id: "expenses",
      title: "Expenses to pay",
      total: list.expenseTotal,
      items: items.filter((item) => item.kind !== "income"),
    },
    {
      id: "income",
      title: "Income to receive",
      total: list.incomeTotal,
      items: items.filter((item) => item.kind === "income"),
    },
  ];
  return groups.filter((group) => group.items.length > 0);
}
