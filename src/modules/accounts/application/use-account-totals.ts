import { useQuery } from "@tanstack/react-query";

import type { AccountsRepository } from "./accounts-repository";
import { statusOf } from "@/shared/api/http-client";
import { ACCOUNTS_KEY } from "@/shared/api/query-keys";

// The backend's totals on their own, for a month the Dashboard has nothing else to say about.
export function useAccountTotals(repository: AccountsRepository, enabled: boolean) {
  const query = useQuery({
    queryKey: ACCOUNTS_KEY,
    queryFn: () => repository.list(),
    retry: (count, error) => statusOf(error) !== 401 && count < 2,
    enabled,
  });
  return query.data ? { currentTotal: query.data.currentTotal } : null;
}
