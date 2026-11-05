"use client";

import { useState, type ReactNode } from "react";
import { cn } from "cn";

import type { ItemSectionCopy } from "../../domain/expense-groups";
import type { PeriodItem } from "../../domain/types";
import { formatCOP } from "@/modules/accounts/domain/money";
import { Button } from "@/shared/ui/button";
import { FormAlert } from "@/shared/ui/form-alert";

interface ItemSectionProps {
  copy: ItemSectionCopy;
  isFiltered: boolean;
  isClosed: boolean;
  items: PeriodItem[];
  summary: number | null;
  notOpened: boolean;
  isLoading: boolean;
  loadFailed: boolean;
  refreshFailed: boolean;
  totalsAreSettling: boolean;
  failure: string | null;
  reload: () => void;
  renderRow: (item: PeriodItem) => ReactNode;
  renderAddForm: (close: () => void) => ReactNode;
}

export function ItemSection({
  copy,
  isFiltered,
  isClosed,
  items,
  summary,
  notOpened,
  isLoading,
  loadFailed,
  refreshFailed,
  totalsAreSettling,
  failure,
  reload,
  renderRow,
  renderAddForm,
}: ItemSectionProps) {
  const [isAdding, setIsAdding] = useState(false);

  if (isLoading) {
    return (
      <div role="status" className="ledger-rows flex h-36 items-end">
        <p className="pb-2 font-mono text-xs text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (notOpened) {
    return <p className="border-t border-rule py-3 text-sm text-muted-foreground">{copy.notOpened}</p>;
  }

  if (loadFailed) {
    return (
      <div className="flex flex-col items-start gap-3">
        <FormAlert message={copy.loadFailed} />
        <Button variant="outline" onClick={reload}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-3">
      <FormAlert message={failure} />
      {refreshFailed ? <p className="text-sm text-muted-foreground">{copy.refreshFailed}</p> : null}

      {summary !== null ? (
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm text-muted-foreground">{copy.summary}</span>
          <span
            className={cn(
              "font-mono text-lg transition-opacity",
              totalsAreSettling && "opacity-60",
            )}
          >
            {formatCOP(summary)}
          </span>
        </div>
      ) : null}

      {items.length === 0 ? (
        <p className="border-t border-rule py-3 text-sm text-muted-foreground">
          {isFiltered ? copy.filtered : copy.empty}
        </p>
      ) : (
        <ul className="flex flex-col">{items.map(renderRow)}</ul>
      )}

      {isClosed ? (
        <p className="mt-auto text-sm text-muted-foreground">{copy.closed}</p>
      ) : isAdding ? (
        <div className="border-t border-rule pt-3">{renderAddForm(() => setIsAdding(false))}</div>
      ) : (
        <Button variant="outline" className="mt-auto lg:self-start" onClick={() => setIsAdding(true)}>
          {copy.add}
        </Button>
      )}
    </div>
  );
}
