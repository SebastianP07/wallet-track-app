"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { TriangleAlert } from "lucide-react";
import { cn } from "cn";

import { formatCOP } from "@/modules/accounts/domain/money";
import { kpiGroups, type KnownKpis, type KpiGroup, type KpiTile } from "../../domain/kpi-tiles";
import { useMessages } from "@/shared/i18n/use-i18n";
import { Button } from "@/shared/ui/button";

const OpeningBalanceForm = dynamic(() =>
  import("./opening-balance-form").then((module) => module.OpeningBalanceForm),
);

// Each row of tiles fills its width at every size, so no count leaves a hole in the grid: two across a
// phone, with the first of three alone on its row, and all of a group on one row from a tablet up, or two
// rows of three for six.
const GROUP_LAYOUT: Record<number, { grid: string; tiles: string[] }> = {
  6: { grid: "md:grid-cols-3", tiles: ["", "", "", "", "", ""] },
  4: { grid: "md:grid-cols-4", tiles: ["", "", "", ""] },
  3: { grid: "md:grid-cols-3", tiles: ["col-span-2 md:col-span-1", "", ""] },
};

// Present only when the month has a period whose opening balance can be set.
export interface OpeningBalanceEditor {
  onSave: (openingBalance: number | null) => void;
  isSaving: boolean;
  failure: string | null;
}

function TileValue({ tile }: { tile: KpiTile }) {
  if (tile.value === null) {
    return <span className="text-muted-foreground">—</span>;
  }
  return (
    <span className="inline-flex items-center gap-1.5">
      {tile.tone === "mismatch" ? <TriangleAlert aria-hidden="true" className="size-4 shrink-0" /> : null}
      {formatCOP(tile.value)}
    </span>
  );
}

interface OpeningBalanceControlsProps {
  tile: KpiTile;
  editor: OpeningBalanceEditor;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
}

function OpeningBalanceControls({ tile, editor, isEditing, setIsEditing }: OpeningBalanceControlsProps) {
  const t = useMessages().dashboard.kpis;
  const isMissing = tile.value === null;

  if (isEditing) {
    return (
      <dd>
        <OpeningBalanceForm
          openingBalance={tile.value}
          onCancel={() => setIsEditing(false)}
          onSubmit={(openingBalance) => {
            editor.onSave(openingBalance);
            setIsEditing(false);
          }}
        />
      </dd>
    );
  }
  return (
    <dd className="flex flex-col items-start gap-1">
      {isMissing ? <span className="text-xs text-signal">{t.openingBalanceMissing}</span> : null}
      <Button
        variant="link"
        className="-ml-2 min-h-11 px-2 text-sm"
        disabled={editor.isSaving}
        aria-label={isMissing ? t.setOpeningBalanceLabel : t.editOpeningBalanceLabel}
        onClick={() => setIsEditing(true)}
      >
        {isMissing ? t.setOpeningBalance : t.editOpeningBalance}
      </Button>
      {editor.failure ? (
        <span role="alert" className="text-xs text-destructive">
          {editor.failure}
        </span>
      ) : null}
    </dd>
  );
}

function Tile({
  tile,
  className,
  editor,
}: {
  tile: KpiTile;
  className: string | undefined;
  editor: OpeningBalanceEditor | null;
}) {
  // The form needs the whole row on a phone, where a tile is half of it.
  const [isEditing, setIsEditing] = useState(false);
  const isEditable = tile.id === "openingBalance" && editor !== null;
  const isNegative = tile.value !== null && tile.value < 0;
  const isMismatch = tile.tone === "mismatch";
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-1 bg-background p-3",
        isMismatch && "bg-due/10 ring-1 ring-due ring-inset",
        className,
        isEditable && isEditing && "col-span-2 md:col-span-3",
      )}
    >
      <dt className={cn("text-sm text-muted-foreground", isMismatch && "font-medium text-due")}>{tile.label}</dt>
      <dd
        className={cn(
          "font-mono text-base leading-snug [overflow-wrap:anywhere] lg:text-lg",
          isNegative && "text-destructive",
          isMismatch && "font-semibold text-due",
          tile.tone === "squared" && "text-muted-foreground",
        )}
      >
        <TileValue tile={tile} />
      </dd>
      <dd className="text-xs text-muted-foreground">{tile.hint}</dd>
      {isEditable && editor ? (
        <OpeningBalanceControls tile={tile} editor={editor} isEditing={isEditing} setIsEditing={setIsEditing} />
      ) : null}
    </div>
  );
}

function Group({ group, editor }: { group: KpiGroup; editor: OpeningBalanceEditor | null }) {
  const layout = GROUP_LAYOUT[group.tiles.length];
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <h4 className="font-mono text-xs tracking-wide text-muted-foreground uppercase">{group.title}</h4>
      <dl className={cn("grid grid-cols-2 gap-px border border-rule bg-rule", layout?.grid)}>
        {group.tiles.map((tile, index) => (
          <Tile key={tile.id} tile={tile} className={layout?.tiles[index]} editor={editor} />
        ))}
      </dl>
    </div>
  );
}

interface KpiOverviewProps {
  kpis: KnownKpis;
  note: string | null;
  isSettling: boolean;
  openingBalance?: OpeningBalanceEditor | null;
}

export function KpiOverview({ kpis, note, isSettling, openingBalance = null }: KpiOverviewProps) {
  const [standing, month] = kpiGroups(kpis, useMessages());
  return (
    <div className={cn("flex flex-col gap-4 transition-opacity", isSettling && "opacity-60")}>
      <Group group={standing} editor={null} />
      <Group group={month} editor={openingBalance} />
      {note ? <p className="text-sm text-muted-foreground">{note}</p> : null}
    </div>
  );
}
