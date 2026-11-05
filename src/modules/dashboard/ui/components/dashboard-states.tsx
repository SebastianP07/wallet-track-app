import { Button } from "@/shared/ui/button";

export function DashboardLoading() {
  return (
    <p role="status" className="font-mono text-xs text-muted-foreground">
      Loading…
    </p>
  );
}

export function DashboardLoadFailed({ what, onRetry }: { what: string; onRetry: () => void }) {
  return (
    <div className="flex items-center gap-3">
      <p className="text-sm text-muted-foreground">{what} could not be loaded.</p>
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
