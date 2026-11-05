import type { ExpenseKind, PeriodItem, PeriodItemList } from "./types";

export interface ItemListCopy {
  empty: string;
  filtered: string;
  loadFailed: string;
  refreshFailed: string;
}

export interface ItemSectionCopy extends ItemListCopy {
  add: string;
  notOpened: string;
  closed: string;
  summary: string;
}

const EXPENSE_STATES = {
  loadFailed: "These expenses could not be loaded.",
  refreshFailed: "Showing the last expenses received; they could not be refreshed.",
  closed: "This month is closed, so it takes no new items. Its items can still be paid, edited or deleted.",
  summary: "To pay",
};

export const EXPENSE_COPY: Record<ExpenseKind, ItemSectionCopy> = {
  fixed: {
    ...EXPENSE_STATES,
    add: "Add fixed expense",
    empty: "No fixed expenses this month.",
    filtered: "No fixed expenses with this tag.",
    notOpened: "Open this month to see its fixed expenses.",
  },
  occasional: {
    ...EXPENSE_STATES,
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
