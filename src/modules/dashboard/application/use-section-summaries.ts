import { useCallback, useSyncExternalStore } from "react";
import { hashKey, useQueryClient, type QueryKey } from "@tanstack/react-query";

import type { DashboardSectionId } from "../domain/sections";
import type { SectionSummary } from "../domain/section-summary";
import type { AccountList } from "@/modules/accounts/domain/types";
import { monthItemsListKey } from "@/modules/expenses/application/use-expense-list";
import type { PeriodItem, PeriodItemList } from "@/modules/expenses/domain/types";
import { overdueItemsKey } from "@/modules/overdue/application/use-overdue-section";
import type { OverdueItemList } from "@/modules/overdue/domain/types";
import type { TemplateList } from "@/modules/periods/domain/types";
import type { Platform } from "@/modules/platforms/domain/types";
import type { TagList } from "@/modules/tags/domain/types";
import {
  ACCOUNTS_KEY,
  PLATFORMS_KEY,
  RECURRING_TEMPLATES_KEY,
  TAGS_KEY,
} from "@/shared/api/query-keys";

// Reads a query's cached data and follows its changes without ever fetching: the section that owns the query
// loads it, so a summary adds no request of its own and shows nothing until that data is there.
function useCachedData<T>(queryKey: QueryKey): T | undefined {
  const client = useQueryClient();
  const hash = hashKey(queryKey);
  const subscribe = useCallback(
    (onChange: () => void) =>
      client.getQueryCache().subscribe((event) => {
        if (event.query.queryHash === hash) {
          onChange();
        }
      }),
    [client, hash],
  );
  return useSyncExternalStore(
    subscribe,
    () => client.getQueryCache().get<T>(hash)?.state.data,
    () => undefined,
  );
}

function summary(count: number, amount: number | null = null, alert = false): SectionSummary {
  return { count, amount, alert };
}

function countOf(items: PeriodItem[], kind: PeriodItem["kind"]): number {
  return items.filter((item) => item.kind === kind).length;
}

// The same rows and totals each section shows, the tag filter included, so a summary never disagrees with what
// opening the section reveals.
export function useSectionSummaries(
  period: string,
  tagId: string | null,
): Partial<Record<DashboardSectionId, SectionSummary>> {
  const accounts = useCachedData<AccountList>(ACCOUNTS_KEY);
  const monthItems = useCachedData<PeriodItemList>(monthItemsListKey(period, tagId));
  const overdue = useCachedData<OverdueItemList>(overdueItemsKey(period));
  const templates = useCachedData<TemplateList>(RECURRING_TEMPLATES_KEY);
  const platforms = useCachedData<Platform[]>(PLATFORMS_KEY);
  const tags = useCachedData<TagList>(TAGS_KEY);

  const summaries: Partial<Record<DashboardSectionId, SectionSummary>> = {};
  if (accounts) {
    summaries.accounts = summary(accounts.items.length, accounts.currentTotal);
  }
  if (monthItems) {
    const { items, totals } = monthItems;
    summaries["fixed-expenses"] = summary(countOf(items, "fixed"), totals.fixed.pending);
    summaries["occasional-expenses"] = summary(countOf(items, "occasional"), totals.occasional.pending);
    summaries.income = summary(countOf(items, "income"), totals.toReceive);
    summaries["card-charges"] = summary(countOf(items, "card_charge"), totals.cardCharge.pending);
  }
  if (overdue) {
    const count = tagId ? overdue.items.filter((item) => item.tagId === tagId).length : overdue.items.length;
    summaries.overdue = summary(count, overdue.expenseTotal, count > 0);
  }
  if (platforms) {
    summaries.platforms = summary(platforms.length);
  }
  if (templates) {
    summaries.templates = summary(templates.items.length);
  }
  if (tags) {
    summaries.tags = summary(tags.items.length);
  }
  return summaries;
}
