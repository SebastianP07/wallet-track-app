import { cn } from "cn";

import { Button } from "@/shared/ui/button";

// className holds the height of what is on its way, so the page below does not jump when it arrives.
export function DashboardLoading({ className }: { className: string }) {
  return (
    <p role="status" className={cn("font-mono text-xs text-muted-foreground", className)}>
      Loading…
    </p>
  );
}

export function DashboardLoadFailed({ what, onRetry }: { what: string; onRetry: () => void }) {
  return (
    <div className="flex items-center gap-3">
      <p role="alert" className="text-sm text-muted-foreground">
        {what} could not be loaded.
      </p>
      <Button variant="link" className="px-2" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}

export function DashboardRefreshFailed() {
  return (
    <p className="text-sm text-muted-foreground">
      Showing the last numbers received; they could not be refreshed.
    </p>
  );
}
