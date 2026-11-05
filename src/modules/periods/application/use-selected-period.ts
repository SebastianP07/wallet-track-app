import { useQuery } from "@tanstack/react-query";

import type { PeriodsRepository } from "./periods-repository";
import { findPeriod } from "../domain/period-list";
import { statusOf } from "@/shared/api/http-client";
import { PERIODS_KEY } from "@/shared/api/query-keys";

// The month's status for sections that only read it. Shares its query with usePeriodStatus.
export function useSelectedPeriod(repository: PeriodsRepository, period: string) {
  const query = useQuery({
    queryKey: PERIODS_KEY,
    queryFn: () => repository.list(),
    retry: (count, error) => statusOf(error) !== 401 && count < 2,
  });
  return findPeriod(query.data, period);
}
