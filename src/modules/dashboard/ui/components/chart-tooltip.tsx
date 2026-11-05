import type { TooltipContentProps } from "recharts";

import { formatCOP } from "@/modules/accounts/domain/money";

// Only ever a convenience: the table beside each chart has every exact value.
export function ChartTooltip({ active, payload }: Partial<TooltipContentProps>) {
  const entry = payload?.[0];
  if (!active || !entry) {
    return null;
  }
  const label = entry.name === "value" ? entry.payload?.name : entry.name;
  return (
    <div className="border border-border bg-popover px-2 py-1 text-xs text-popover-foreground">
      <span className="text-muted-foreground">{String(label)}</span>{" "}
      <span className="font-mono">{formatCOP(Number(entry.value))}</span>
    </div>
  );
}
