import type { ReactNode } from "react";
import { cn } from "cn";

import type { CardGroup } from "../../domain/card-groups";
import { formatCOP } from "@/modules/accounts/domain/money";
import type { PeriodItem } from "@/modules/expenses/domain/types";
import { Button } from "@/shared/ui/button";

interface CardGroupsListProps {
  groups: CardGroup[];
  isFiltered: boolean;
  totalsLoadFailed: boolean;
  totalsAreSettling: boolean;
  reloadTotals: () => void;
  renderRow: (item: PeriodItem) => ReactNode;
}

export function CardGroupsList({
  groups,
  isFiltered,
  totalsLoadFailed,
  totalsAreSettling,
  reloadTotals,
  renderRow,
}: CardGroupsListProps) {
  return (
    <div className="flex flex-col gap-4">
      {totalsLoadFailed ? (
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">The per-card totals could not be loaded.</p>
          <Button variant="link" className="shrink-0 px-2" onClick={reloadTotals}>
            Try again
          </Button>
        </div>
      ) : null}
      {isFiltered ? (
        <p className="text-sm text-muted-foreground">Card totals cover the whole month, whatever the tag.</p>
      ) : null}

      {groups.map((group) => (
        <div key={group.cardId ?? "deleted-card"} className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between gap-3">
            <h4 className="min-w-0 font-medium wrap-anywhere">{group.title}</h4>
            <span
              className={cn(
                "shrink-0 font-mono text-sm whitespace-nowrap transition-opacity",
                totalsAreSettling && "opacity-60",
              )}
            >
              {group.total === null ? "—" : formatCOP(group.total)}
            </span>
          </div>
          {group.cardId === null ? (
            <p className="text-sm text-muted-foreground">
              Their card was deleted. Edit a charge to move it to another card.
            </p>
          ) : null}
          {group.items.length === 0 ? (
            <p className="border-t border-rule py-2 text-sm text-muted-foreground">
              No charges this month.
            </p>
          ) : (
            <ul className="flex flex-col">{group.items.map(renderRow)}</ul>
          )}
        </div>
      ))}
    </div>
  );
}
