import type { ReactNode } from "react";
import { cn } from "cn";

import type { OverdueGroup } from "../../domain/overdue-groups";
import { formatCOP } from "@/modules/accounts/domain/money";
import type { PeriodItem } from "@/modules/expenses/domain/types";
import { useMessages } from "@/shared/i18n/use-i18n";

interface OverdueGroupsListProps {
  groups: OverdueGroup[];
  isFiltered: boolean;
  totalsAreSettling: boolean;
  renderRow: (item: PeriodItem) => ReactNode;
}

export function OverdueGroupsList({ groups, isFiltered, totalsAreSettling, renderRow }: OverdueGroupsListProps) {
  const t = useMessages().overdue;
  return (
    <div className="flex flex-col gap-4">
      {isFiltered ? (
        <p className="text-sm text-muted-foreground">{t.totalsWholeList}</p>
      ) : null}
      {groups.map((group) => (
        <div key={group.id} className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between gap-3">
            <h4 className="min-w-0 font-medium">{t.groups[group.id]}</h4>
            <span
              className={cn(
                "shrink-0 font-mono text-sm whitespace-nowrap transition-opacity",
                totalsAreSettling && "opacity-60",
              )}
            >
              {formatCOP(group.total)}
            </span>
          </div>
          <ul className="flex flex-col">{group.items.map(renderRow)}</ul>
        </div>
      ))}
    </div>
  );
}
