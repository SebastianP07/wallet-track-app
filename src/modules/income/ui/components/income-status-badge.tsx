import { AlertTriangle } from "lucide-react";
import { cn } from "cn";

import { BADGE } from "@/modules/expenses/ui/components/urgency-badge";
import type { PeriodItem } from "@/modules/expenses/domain/types";

const LOOK = cn(BADGE, "border-rule text-muted-foreground");

// Income has no due date, so no urgency: only whether it is still expected.
export function IncomeStatusBadge({ status }: { status: PeriodItem["status"] }) {
  switch (status) {
    case "pending":
      return <span className={LOOK}>Expected</span>;
    case "done":
      return <span className={LOOK}>Received</span>;
    case "overdue":
      return (
        <span className={LOOK}>
          <AlertTriangle aria-hidden="true" className="size-3" />
          Overdue
        </span>
      );
  }
}
