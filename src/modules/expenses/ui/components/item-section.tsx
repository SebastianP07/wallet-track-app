"use client";

import { useState, type ReactNode } from "react";
import { cn } from "cn";

import type { ItemSectionCopy } from "../../domain/expense-groups";
import type { PeriodItem } from "../../domain/types";
import { ItemList } from "./item-list";
import { formatCOP } from "@/modules/accounts/domain/money";
import { Button } from "@/shared/ui/button";

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
  // For a section that lays out its rows some other way than one plain list.
  renderItems?: (items: PeriodItem[]) => ReactNode;
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
  renderItems,
  renderAddForm,
}: ItemSectionProps) {
  const [isAdding, setIsAdding] = useState(false);

  if (notOpened && !isLoading) {
    return <p className="border-t border-rule py-3 text-sm text-muted-foreground">{copy.notOpened}</p>;
  }

  return (
    <ItemList
      copy={copy}
      isFiltered={isFiltered}
      items={items}
      isLoading={isLoading}
      loadFailed={loadFailed}
      refreshFailed={refreshFailed}
      failure={failure}
      reload={reload}
      renderRow={renderRow}
      renderItems={renderItems}
      summary={
        summary !== null ? (
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
        ) : null
      }
      footer={
        isClosed ? (
          <p className="mt-auto text-sm text-muted-foreground">{copy.closed}</p>
        ) : isAdding ? (
          <div className="border-t border-rule pt-3">{renderAddForm(() => setIsAdding(false))}</div>
        ) : (
          <Button variant="outline" className="mt-auto lg:self-start" onClick={() => setIsAdding(true)}>
            {copy.add}
          </Button>
        )
      }
    />
  );
}
