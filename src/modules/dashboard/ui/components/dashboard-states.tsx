import { cn } from "cn";

import { useMessages } from "@/shared/i18n/use-i18n";
import { Button } from "@/shared/ui/button";

// className holds the height of what is on its way, so the page below does not jump when it arrives.
export function DashboardLoading({ className }: { className: string }) {
  const t = useMessages().common;
  return (
    <p role="status" className={cn("font-mono text-xs text-muted-foreground", className)}>
      {t.loading}
    </p>
  );
}

export function DashboardLoadFailed({ message, onRetry }: { message: string; onRetry: () => void }) {
  const t = useMessages().common;
  return (
    <div className="flex items-center gap-3">
      <p role="alert" className="text-sm text-muted-foreground">
        {message}
      </p>
      <Button variant="link" className="px-2" onClick={onRetry}>
        {t.tryAgain}
      </Button>
    </div>
  );
}

export function DashboardRefreshFailed() {
  const t = useMessages().dashboard;
  return <p className="text-sm text-muted-foreground">{t.refreshFailed}</p>;
}
