"use client";

import { useState } from "react";

import { formatCOP } from "@/modules/accounts/domain/money";
import type { PeriodItem } from "@/modules/expenses/domain/types";
import { UrgencyBadge } from "@/modules/expenses/ui/components/urgency-badge";
import { formatDate } from "@/shared/format/date";
import { useI18n } from "@/shared/i18n/use-i18n";
import { Button } from "@/shared/ui/button";

const SHOWN_AT_FIRST = 6;

interface UpcomingDueListProps {
  items: PeriodItem[];
}

export function UpcomingDueList({ items }: UpcomingDueListProps) {
  const [showsAll, setShowsAll] = useState(false);
  const { messages } = useI18n();
  const t = messages.dashboard.upcoming;
  const kinds: Partial<Record<PeriodItem["kind"], string>> = messages.expenses.kinds;
  const shown = showsAll ? items : items.slice(0, SHOWN_AT_FIRST);
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <h4 className="font-mono text-xs tracking-wide text-muted-foreground uppercase">{t.title}</h4>
      {items.length === 0 ? (
        <p className="ledger-rows flex h-55 items-center justify-center text-sm text-muted-foreground">
          <span className="bg-background px-2">{t.nothingPending}</span>
        </p>
      ) : (
        <ol className="flex flex-col">
          {shown.map((item) => (
            <li key={item.id} className="flex flex-col gap-0.5 border-t border-rule py-2 first:border-t-0 first:pt-0">
              <div className="flex items-baseline justify-between gap-3">
                <span className="min-w-0 text-sm [overflow-wrap:anywhere]">{item.name}</span>
                <span className="shrink-0 font-mono text-xs tabular-nums">{formatCOP(item.amount)}</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                {item.dueDate ? <span className="text-due">{t.due(formatDate(item.dueDate))}</span> : <span>{t.noDueDate}</span>}
                <span>· {kinds[item.kind]}</span>
                <UrgencyBadge item={item} />
              </div>
            </li>
          ))}
        </ol>
      )}
      {items.length > SHOWN_AT_FIRST ? (
        <Button variant="link" className="w-fit px-0" onClick={() => setShowsAll(!showsAll)}>
          {showsAll ? t.showFewer : t.showAll(items.length)}
        </Button>
      ) : null}
    </div>
  );
}
