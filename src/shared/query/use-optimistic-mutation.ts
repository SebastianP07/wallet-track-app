import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";

export interface OptimisticChange<List, Result> {
  next: List;
  // Each undoes only its own edit, so a failure never discards another edit still in flight.
  undo: (list: List) => List;
  confirm?: (list: List, result: Result) => List;
}

export function useOptimisticMutation<List, Variables, Result>(options: {
  // The cached list this change is shown in.
  queryKey: QueryKey;
  // What counts as the same work, for lists kept in several cache entries. Defaults to queryKey.
  syncKey?: QueryKey;
  // What the change can make out of date, refetched once the last of this work finishes. Defaults to syncKey.
  refreshes?: QueryKey[];
  // Mutations in one scope reach the server in order, for changes where the last tap must win.
  scope?: string;
  mutationFn: (variables: Variables) => Promise<Result>;
  change: (list: List, variables: Variables) => OptimisticChange<List, Result>;
  onStart: () => void;
  onFailure: (error: unknown) => void;
}) {
  const queryClient = useQueryClient();
  const { queryKey, syncKey = queryKey, refreshes = [syncKey], scope } = options;
  const update = (apply: (list: List) => List) =>
    queryClient.setQueryData<List>(queryKey, (list) => list && apply(list));

  return useMutation({
    mutationKey: syncKey,
    scope: scope ? { id: scope } : undefined,
    mutationFn: options.mutationFn,
    onMutate: async (variables) => {
      options.onStart();
      await queryClient.cancelQueries({ queryKey: syncKey });
      const list = queryClient.getQueryData<List>(queryKey);
      if (!list) {
        return null;
      }
      const change = options.change(list, variables);
      queryClient.setQueryData(queryKey, change.next);
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
      queryClient.isMutating({ mutationKey: syncKey }) === 1
        ? Promise.all(refreshes.map((key) => queryClient.invalidateQueries({ queryKey: key })))
        : undefined,
  });
}
