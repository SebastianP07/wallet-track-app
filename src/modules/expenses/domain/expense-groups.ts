import type { ExpenseKind, PeriodItem, PeriodItemList } from "./types";

export const EXPENSE_COPY: Record<ExpenseKind, { add: string; empty: string; filtered: string; notOpened: string }> = {
  fixed: {
    add: "Add fixed expense",
    empty: "No fixed expenses this month.",
    filtered: "No fixed expenses with this tag.",
    notOpened: "Open this month to see its fixed expenses.",
  },
  occasional: {
    add: "Add occasional expense",
    empty: "No occasional expenses this month.",
    filtered: "No occasional expenses with this tag.",
    notOpened: "Open this month to see its occasional expenses.",
  },
};

export function itemsOf(list: PeriodItemList | undefined, kind: ExpenseKind): PeriodItem[] {
  return list ? list.items.filter((item) => item.kind === kind) : [];
}

const DATE_FORMAT = { timeZone: "UTC", month: "short", day: "numeric" } as const;

// A calendar date, so it is read in UTC to come out as written. The year shows only when it is not the month's.
export function formatDueDate(dueDate: string, period: string): string {
  const date = new Date(`${dueDate}T00:00:00Z`);
  const format = dueDate.slice(0, 4) === period.slice(0, 4) ? DATE_FORMAT : { ...DATE_FORMAT, year: "numeric" as const };
  return new Intl.DateTimeFormat("en-US", format).format(date);
}
