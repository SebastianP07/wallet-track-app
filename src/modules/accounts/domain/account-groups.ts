import type { Account, AccountKind, AccountList } from "./types";

export type AccountGroup = "spendable" | "savings";

export const KIND_LABELS: Record<AccountKind, string> = {
  bank: "Bank",
  wallet: "Wallet",
  cash: "Cash",
  food_card: "Food card",
  savings: "Savings",
};

const GROUP_KINDS: Record<AccountGroup, readonly [AccountKind, ...AccountKind[]]> = {
  spendable: ["bank", "wallet", "cash", "food_card"],
  savings: ["savings"],
};

export function kindsOf(group: AccountGroup) {
  return GROUP_KINDS[group];
}

export function accountsOf(list: AccountList, group: AccountGroup): Account[] {
  return list.items.filter((account) => GROUP_KINDS[group].includes(account.kind));
}

// Picks one of the totals the backend computed; the frontend never adds balances up (D1).
export function totalOf(list: AccountList, group: AccountGroup): number {
  return group === "savings" ? list.savingsTotal : list.currentTotal;
}
