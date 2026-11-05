import type { Account, AccountList } from "./types";

const PENDING_ID_PREFIX = "pending-";

let pendingCount = 0;

// A row the server has not confirmed. Its id means nothing there, so it cannot be edited yet.
export function pendingAccountId(): string {
  pendingCount += 1;
  return `${PENDING_ID_PREFIX}${pendingCount}`;
}

export function isPendingAccount(account: Account): boolean {
  return account.id.startsWith(PENDING_ID_PREFIX);
}

// These change the rows only. Totals stay as the backend last sent them until the next refetch (D1).
export function withAccount(list: AccountList, account: Account, index = list.items.length): AccountList {
  const items = [...list.items];
  items.splice(index, 0, account);
  return { ...list, items };
}

export function withReplacedAccount(list: AccountList, id: string, account: Account): AccountList {
  return { ...list, items: list.items.map((item) => (item.id === id ? account : item)) };
}

export function withoutAccount(list: AccountList, id: string): AccountList {
  return { ...list, items: list.items.filter((item) => item.id !== id) };
}
