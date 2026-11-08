import type { ExpenseKind, PeriodItem, PeriodItemList } from "./types";
import { languageTag, type Locale } from "@/shared/i18n/locale";

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

export function itemsOf(list: PeriodItemList | undefined, kind: ExpenseKind): PeriodItem[] {
  return list ? list.items.filter((item) => item.kind === kind) : [];
}

const DATE_FORMAT = { timeZone: "UTC", month: "short", day: "numeric" } as const;

// A calendar date, so it is read in UTC to come out as written. The year shows only when it is not the month's.
export function formatDueDate(dueDate: string, period: string, locale: Locale): string {
  const date = new Date(`${dueDate}T00:00:00Z`);
  const format = dueDate.slice(0, 4) === period.slice(0, 4) ? DATE_FORMAT : { ...DATE_FORMAT, year: "numeric" as const };
  return new Intl.DateTimeFormat(languageTag(locale), format).format(date);
}
