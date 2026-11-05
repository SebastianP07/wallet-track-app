import { cn } from "cn";

import { formatCOP } from "@/modules/accounts/domain/money";
import { kpiGroups, type KnownKpis, type KpiGroup, type KpiTile } from "../../domain/kpi-tiles";

// Each row of tiles fills its width at every size, so no count leaves a hole in the grid: two across a
// phone with the first alone on its row, and the five in rows of two and three on a tablet.
const GROUP_LAYOUT: Record<number, { grid: string; tiles: string[] }> = {
  5: {
    grid: "md:grid-cols-6 lg:grid-cols-5",
    tiles: [
      "col-span-2 md:col-span-3 lg:col-span-1",
      "md:col-span-3 lg:col-span-1",
      "md:col-span-2 lg:col-span-1",
      "md:col-span-2 lg:col-span-1",
      "md:col-span-2 lg:col-span-1",
    ],
  },
  3: { grid: "md:grid-cols-3", tiles: ["col-span-2 md:col-span-1", "", ""] },
};

function Tile({ tile, className }: { tile: KpiTile; className: string | undefined }) {
  const isNegative = tile.value !== null && tile.value < 0;
  return (
    <div className={cn("flex min-w-0 flex-col gap-1 bg-background p-3", className)}>
      <dt className="text-sm text-muted-foreground">{tile.label}</dt>
      <dd
        className={cn(
          "font-mono text-base leading-snug [overflow-wrap:anywhere] lg:text-lg",
          isNegative && "text-destructive",
        )}
      >
        {tile.value === null ? <span className="text-muted-foreground">—</span> : formatCOP(tile.value)}
      </dd>
      <dd className="text-xs text-muted-foreground">{tile.hint}</dd>
    </div>
  );
}

function Group({ group }: { group: KpiGroup }) {
  const layout = GROUP_LAYOUT[group.tiles.length];
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <h4 className="font-mono text-xs tracking-wide text-muted-foreground uppercase">{group.title}</h4>
      <dl className={cn("grid grid-cols-2 gap-px border border-rule bg-rule", layout?.grid)}>
        {group.tiles.map((tile, index) => (
          <Tile key={tile.label} tile={tile} className={layout?.tiles[index]} />
        ))}
      </dl>
    </div>
  );
}

interface KpiOverviewProps {
  kpis: KnownKpis;
  note: string | null;
  isSettling: boolean;
}

export function KpiOverview({ kpis, note, isSettling }: KpiOverviewProps) {
  const [standing, month] = kpiGroups(kpis);
  return (
    <div className={cn("flex flex-col gap-4 transition-opacity", isSettling && "opacity-60")}>
      <Group group={standing} />
      <Group group={month} />
      {note ? <p className="text-sm text-muted-foreground">{note}</p> : null}
    </div>
  );
}
