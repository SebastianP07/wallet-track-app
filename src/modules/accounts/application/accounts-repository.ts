import type { Account, AccountCreate, AccountList, AccountUpdate } from "../domain/types";

export interface AccountsRepository {
  list(): Promise<AccountList>;
  create(account: AccountCreate): Promise<Account>;
  update(id: string, changes: AccountUpdate): Promise<Account>;
  remove(id: string): Promise<void>;
}
