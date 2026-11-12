import { RefreshCw } from "lucide-react";
import { cn } from "cn";

import { useMessages } from "@/shared/i18n/use-i18n";
import { Button } from "@/shared/ui/button";

interface RefreshActionProps {
  isRefreshing: boolean;
  onRefresh: () => void;
}

// Offline, the Dashboard's disabled fieldset turns it off with every other control.
export function RefreshAction({ isRefreshing, onRefresh }: RefreshActionProps) {
  const t = useMessages().dashboard.refresh;
  return (
    <Button
      variant="outline"
      className="px-0"
      aria-label={t.action}
      title={t.action}
      disabled={isRefreshing}
      onClick={onRefresh}
    >
      <RefreshCw aria-hidden="true" className={cn("size-4", isRefreshing && "animate-spin")} />
    </Button>
  );
}
