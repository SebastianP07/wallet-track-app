import type { OverdueItemList } from "./types";
import type { PeriodItem } from "@/modules/expenses/domain/types";

export interface OverdueGroup {
  // Also the key of its title in the messages.
  id: "expenses" | "income";
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
      total: list.expenseTotal,
      items: items.filter((item) => item.kind !== "income"),
    },
    {
      id: "income",
      total: list.incomeTotal,
      items: items.filter((item) => item.kind === "income"),
    },
  ];
  return groups.filter((group) => group.items.length > 0);
}
