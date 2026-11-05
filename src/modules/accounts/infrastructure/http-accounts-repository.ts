import type { AccountsRepository } from "../application/accounts-repository";
import type { Account, AccountList } from "../domain/types";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/shared/api/http-client";

export const httpAccountsRepository: AccountsRepository = {
  list() {
    return apiGet<AccountList>("/accounts");
  },
  create(account) {
    return apiPost<Account>("/accounts", account);
  },
  update(id, changes) {
    return apiPatch<Account>(`/accounts/${encodeURIComponent(id)}`, changes);
  },
  remove(id) {
    return apiDelete(`/accounts/${encodeURIComponent(id)}`);
  },
};
