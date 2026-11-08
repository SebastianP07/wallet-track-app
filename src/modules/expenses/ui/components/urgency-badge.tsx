import { AlertTriangle, Clock } from "lucide-react";
import { cn } from "cn";

import type { PeriodItem } from "../../domain/types";
import { useMessages } from "@/shared/i18n/use-i18n";

export const BADGE = "inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-xs font-medium whitespace-nowrap";
const RED = "border-red-400/70 text-red-400";
const YELLOW = "border-yellow-300/60 text-yellow-300";

// The level comes from the backend (D11). Icon and word carry it too, so it never rests on color.
export function UrgencyBadge({ item }: { item: PeriodItem }) {
  const t = useMessages().expenses.badges;
  if (item.status === "done") {
    return <span className={cn(BADGE, "border-rule text-muted-foreground")}>{t.paid}</span>;
  }
  if (item.status === "overdue") {
    return (
      <span className={cn(BADGE, item.urgency === "none" ? "border-rule text-muted-foreground" : RED)}>
        <AlertTriangle aria-hidden="true" className="size-3" />
        {t.overdue}
      </span>
    );
  }
  switch (item.urgency) {
    case "red":
      return (
        <span className={cn(BADGE, RED)}>
          <AlertTriangle aria-hidden="true" className="size-3" />
          {t.urgent}
        </span>
      );
    case "yellow":
      return (
        <span className={cn(BADGE, YELLOW)}>
          <Clock aria-hidden="true" className="size-3" />
          {t.dueSoon}
        </span>
      );
    case "none":
      return null;
  }
}
