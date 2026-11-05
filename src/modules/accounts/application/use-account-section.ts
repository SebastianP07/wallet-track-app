import { useEffect, useState } from "react";
import { useIsMutating, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
import { ApiError } from "@/shared/api/http-client";

const ACCOUNTS_KEY = ["accounts"];
const NO_CONNECTION_STATUS = 0;

const statusOf = (error: unknown) =>
  error instanceof ApiError ? error.status : NO_CONNECTION_STATUS;

interface OptimisticChange<Result> {
  next: AccountList;
  // Each undoes only its own edit, so a failure never discards another edit still in flight.
  undo: (list: AccountList) => AccountList;
  confirm?: (list: AccountList, result: Result) => AccountList;
}

function useOptimisticMutation<Variables, Result>(options: {
  mutationFn: (variables: Variables) => Promise<Result>;
  change: (list: AccountList, variables: Variables) => OptimisticChange<Result>;
  onStart: () => void;
  onFailure: (error: unknown) => void;
}) {
  const queryClient = useQueryClient();
  const update = (apply: (list: AccountList) => AccountList) =>
    queryClient.setQueryData<AccountList>(ACCOUNTS_KEY, (list) => list && apply(list));

  return useMutation({
    mutationKey: ACCOUNTS_KEY,
    mutationFn: options.mutationFn,
    onMutate: async (variables) => {
      options.onStart();
      await queryClient.cancelQueries({ queryKey: ACCOUNTS_KEY });
      const list = queryClient.getQueryData<AccountList>(ACCOUNTS_KEY);
      if (!list) {
        return null;
      }
      const change = options.change(list, variables);
      queryClient.setQueryData(ACCOUNTS_KEY, change.next);
      return change;
    },
    onSuccess: (result, _variables, change) => {
      if (change?.confirm) {
        update((list) => change.confirm!(list, result));
      }
    },
    onError: (error, _variables, change) => {
      if (change) {
        update(change.undo);
      }
      options.onFailure(error);
    },
    // The last one to finish refetches; the totals only ever come from there (D1).
    onSettled: () =>
      queryClient.isMutating({ mutationKey: ACCOUNTS_KEY }) === 1
        ? queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY })
        : undefined,
  });
}

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

  const create = useOptimisticMutation<AccountCreate, Account>({
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

  const update = useOptimisticMutation<{ id: string; changes: AccountUpdate }, Account>({
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

  const remove = useOptimisticMutation<string, void>({
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
