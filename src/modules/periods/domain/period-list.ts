import type { Period, PeriodList } from "./types";

export function findPeriod(list: PeriodList | undefined, period: string): Period | null {
  return list?.items.find((item) => item.period === period) ?? null;
}

// The list stays newest first, as the backend sends it.
export function withPeriod(list: PeriodList, period: Period): PeriodList {
  const others = list.items.filter((item) => item.period !== period.period);
  const items = [...others, period].sort((a, b) => b.period.localeCompare(a.period));
  return { ...list, items };
}
