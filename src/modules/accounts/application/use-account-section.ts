import { useEffect, useState } from "react";
import { useIsMutating, useQuery } from "@tanstack/react-query";

import type { AccountsRepository } from "./accounts-repository";
import { describeAccountFailure } from "../domain/account-failure";
import { accountsOf, totalOf, type AccountGroup } from "../domain/account-groups";
import {
  pendingAccountId,
  withAccount,
  withoutAccount,
  withReplacedAccount,
} from "../domain/optimistic-list";
import type { Account, AccountCreate, AccountList, AccountUpdate } from "../domain/types";
import { statusOf } from "@/shared/api/http-client";
import { ACCOUNTS_KEY } from "@/shared/api/query-keys";
import { useOptimisticMutation } from "@/shared/query/use-optimistic-mutation";

// Both sections read the one accounts query. Balances are current values, so the month is not part of it.
export function useAccountSection(
  repository: AccountsRepository,
  group: AccountGroup,
  onSessionEnded: () => void,
) {
  const [failure, setFailure] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ACCOUNTS_KEY,
    queryFn: () => repository.list(),
    retry: (count, error) => statusOf(error) !== 401 && count < 2,
  });
  const inFlight = useIsMutating({ mutationKey: ACCOUNTS_KEY });

  const { error: queryError } = query;
  useEffect(() => {
    if (statusOf(queryError) === 401) {
      onSessionEnded();
    }
  }, [queryError, onSessionEnded]);

  const onStart = () => setFailure(null);
  const onFailure = (error: unknown) => {
    if (statusOf(error) === 401) {
      onSessionEnded();
      return;
    }
    setFailure(describeAccountFailure(statusOf(error)));
  };

  const create = useOptimisticMutation<AccountList, AccountCreate, Account>({
    queryKey: ACCOUNTS_KEY,
    mutationFn: (account) => repository.create(account),
    change: (list, account) => {
      const now = new Date().toISOString();
      const pending: Account = {
        id: pendingAccountId(),
        balance: 0,
        ...account,
        createdAt: now,
        updatedAt: now,
      };
      return {
        next: withAccount(list, pending),
        undo: (current) => withoutAccount(current, pending.id),
        confirm: (current, created) => withReplacedAccount(current, pending.id, created),
      };
    },
    onStart,
    onFailure,
  });

  const update = useOptimisticMutation<AccountList, { id: string; changes: AccountUpdate }, Account>({
    queryKey: ACCOUNTS_KEY,
    mutationFn: ({ id, changes }) => repository.update(id, changes),
    change: (list, { id, changes }) => {
      const previous = list.items.find((account) => account.id === id);
      if (!previous) {
        return { next: list, undo: (current) => current };
      }
      return {
        next: withReplacedAccount(list, id, { ...previous, ...changes }),
        undo: (current) => withReplacedAccount(current, id, previous),
        confirm: (current, updated) => withReplacedAccount(current, id, updated),
      };
    },
    onStart,
    onFailure,
  });

  const remove = useOptimisticMutation<AccountList, string, void>({
    queryKey: ACCOUNTS_KEY,
    mutationFn: (id) => repository.remove(id),
    change: (list, id) => {
      const index = list.items.findIndex((account) => account.id === id);
      const previous = list.items[index];
      if (!previous) {
        return { next: list, undo: (current) => current };
      }
      return {
        next: withoutAccount(list, id),
        undo: (current) => withAccount(current, previous, Math.min(index, current.items.length)),
      };
    },
    onStart,
    onFailure,
  });

  const list = query.data;
  return {
    accounts: list ? accountsOf(list, group) : [],
    total: list ? totalOf(list, group) : null,
    isLoading: query.isPending,
    loadFailed: query.isError && !list,
    refreshFailed: query.isError && Boolean(list),
    // The rows are ahead of the total until the refetch after a change brings it back in step.
    totalIsSettling: inFlight > 0 || query.isFetching,
    isCreating: create.isPending,
    failure,
    reload: () => void query.refetch(),
    createAccount: create.mutate,
    rename: (id: string, name: string) => update.mutate({ id, changes: { name } }),
    setBalance: (id: string, balance: number) => update.mutate({ id, changes: { balance } }),
    deleteAccount: (id: string) => remove.mutate(id),
  };
}
