"use client";

import { useState } from "react";

import { formatCOP } from "@/modules/accounts/domain/money";
import { formatDueDate } from "@/modules/expenses/domain/expense-groups";
import type { PeriodItem } from "@/modules/expenses/domain/types";
import { UrgencyBadge } from "@/modules/expenses/ui/components/urgency-badge";
import { Button } from "@/shared/ui/button";

const SHOWN_AT_FIRST = 6;
const KIND_LABEL: Partial<Record<PeriodItem["kind"], string>> = { fixed: "Fixed", occasional: "Occasional" };

interface UpcomingDueListProps {
  items: PeriodItem[];
  period: string;
}

export function UpcomingDueList({ items, period }: UpcomingDueListProps) {
  const [showsAll, setShowsAll] = useState(false);
  const shown = showsAll ? items : items.slice(0, SHOWN_AT_FIRST);
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <h4 className="font-mono text-xs tracking-wide text-muted-foreground uppercase">Upcoming due</h4>
      {items.length === 0 ? (
        <p className="ledger-rows flex h-55 items-center justify-center text-sm text-muted-foreground">
          <span className="bg-background px-2">Nothing pending this month.</span>
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
                <span>{item.dueDate ? `Due ${formatDueDate(item.dueDate, period)}` : "No due date"}</span>
                <span>· {KIND_LABEL[item.kind]}</span>
                <UrgencyBadge item={item} />
              </div>
            </li>
          ))}
        </ol>
      )}
      {items.length > SHOWN_AT_FIRST ? (
        <Button variant="link" className="w-fit px-0" onClick={() => setShowsAll(!showsAll)}>
          {showsAll ? "Show fewer" : `Show all ${items.length}`}
        </Button>
      ) : null}
    </div>
  );
}
