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

export function itemsOf(list: PeriodItemList | undefined, kind: ExpenseKind): PeriodItem[] {
  return list ? list.items.filter((item) => item.kind === kind) : [];
}
