import { cn } from "cn";

import { formatCOP } from "@/modules/accounts/domain/money";
import { Button } from "@/shared/ui/button";
import type { PeriodItemList } from "../../domain/types";

interface ToPaySummaryProps {
  list: PeriodItemList | undefined;
  notOpened: boolean;
  isLoading: boolean;
  loadFailed: boolean;
  totalsAreSettling: boolean;
  reload: () => void;
}

// Every number is the backend's (D1).
export function ToPaySummary({
  list,
  notOpened,
  isLoading,
  loadFailed,
  totalsAreSettling,
  reload,
}: ToPaySummaryProps) {
  if (isLoading) {
    return (
      <p role="status" className="font-mono text-xs text-muted-foreground">
        Loading…
      </p>
    );
  }
  if (notOpened) {
    return <p className="text-sm text-muted-foreground">This month has not been opened yet.</p>;
  }
  if (loadFailed || !list) {
    return (
      <div className="flex items-center gap-3">
        <p className="text-sm text-muted-foreground">To pay could not be loaded.</p>
        <Button variant="link" className="px-2" onClick={reload}>
          Try again
        </Button>
      </div>
    );
  }
  return (
    <dl className={cn("flex flex-col gap-1 transition-opacity", totalsAreSettling && "opacity-60")}>
      <dt className="text-sm text-muted-foreground">To pay</dt>
      <dd className="font-mono text-2xl">{formatCOP(list.totals.toPay)}</dd>
      <dd className="text-xs text-muted-foreground">
        Fixed {formatCOP(list.totals.fixed.pending)} · Occasional {formatCOP(list.totals.occasional.pending)}
      </dd>
    </dl>
  );
}
