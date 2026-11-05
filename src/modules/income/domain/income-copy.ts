import type { ItemSectionCopy } from "@/modules/expenses/domain/expense-groups";

export const INCOME_COPY: ItemSectionCopy = {
  add: "Add income",
  empty: "No income this month.",
  filtered: "No income with this tag.",
  notOpened: "Open this month to see its income.",
  loadFailed: "This income could not be loaded.",
  refreshFailed: "Showing the income last loaded; it could not be refreshed.",
  closed: "This month is closed, so it takes no new items. Its items can still be marked received, edited or deleted.",
  summary: "To arrive",
};
