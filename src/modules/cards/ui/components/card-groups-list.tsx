import type { ReactNode } from "react";
import { cn } from "cn";

import type { CardGroup } from "../../domain/card-groups";
import { formatCOP } from "@/modules/accounts/domain/money";
import type { PeriodItem } from "@/modules/expenses/domain/types";
import { useMessages } from "@/shared/i18n/use-i18n";
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
  const { common, cards: t } = useMessages();
  return (
    <div className="flex flex-col gap-4">
      {totalsLoadFailed ? (
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">{t.totalsLoadFailed}</p>
          <Button variant="link" className="shrink-0 px-2" onClick={reloadTotals}>
            {common.tryAgain}
          </Button>
        </div>
      ) : null}
      {isFiltered ? (
        <p className="text-sm text-muted-foreground">{t.totalsWholeMonth}</p>
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
              {t.cardDeleted}
            </p>
          ) : null}
          {group.items.length === 0 ? (
            <p className="border-t border-rule py-2 text-sm text-muted-foreground">
              {t.noCharges}
            </p>
          ) : (
            <ul className="flex flex-col">{group.items.map(renderRow)}</ul>
          )}
        </div>
      ))}
    </div>
  );
}
