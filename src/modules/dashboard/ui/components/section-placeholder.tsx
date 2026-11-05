import { cn } from "cn";

import type { DashboardSection } from "../../domain/sections";

const ROW_HEIGHT = { 2: "h-18", 4: "h-36", 6: "h-54" } as const;

export function SectionPlaceholder({ rows }: { rows: DashboardSection["rows"] }) {
  return (
    <div className={cn("ledger-rows mt-auto flex items-end", ROW_HEIGHT[rows])}>
      <p className="pb-2 font-mono text-xs text-muted-foreground">Nothing here yet</p>
    </div>
  );
}
