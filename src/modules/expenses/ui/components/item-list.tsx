"use client";

import type { ReactNode } from "react";

import type { ItemListCopy } from "../../domain/expense-groups";
import type { PeriodItem } from "../../domain/types";
import { useMessages } from "@/shared/i18n/use-i18n";
import { Button } from "@/shared/ui/button";
import { FormAlert } from "@/shared/ui/form-alert";

interface ItemListProps {
  copy: ItemListCopy;
  isFiltered: boolean;
  items: PeriodItem[];
  isLoading: boolean;
  loadFailed: boolean;
  refreshFailed: boolean;
  failure: string | null;
  reload: () => void;
  summary?: ReactNode;
  footer?: ReactNode;
  renderRow?: (item: PeriodItem) => ReactNode;
  // For a list that lays out its rows some other way than one plain list.
  renderItems?: (items: PeriodItem[]) => ReactNode;
}

export function ItemList({
  copy,
  isFiltered,
  items,
  isLoading,
  loadFailed,
  refreshFailed,
  failure,
  reload,
  summary,
  footer,
  renderRow,
  renderItems,
}: ItemListProps) {
  const t = useMessages().common;
  if (isLoading) {
    return (
      <div role="status" className="ledger-rows flex h-36 items-end">
        <p className="pb-2 font-mono text-xs text-muted-foreground">{t.loading}</p>
      </div>
    );
  }

  if (loadFailed) {
    return (
      <div className="flex flex-col items-start gap-3">
        <FormAlert message={copy.loadFailed} />
        <Button variant="outline" onClick={reload}>
          {t.tryAgain}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-3">
      <FormAlert message={failure} />
      {refreshFailed ? <p className="text-sm text-muted-foreground">{copy.refreshFailed}</p> : null}
      {summary}

      {items.length === 0 ? (
        <p className="border-t border-rule py-3 text-sm text-muted-foreground">
          {isFiltered ? copy.filtered : copy.empty}
        </p>
      ) : renderItems ? (
        renderItems(items)
      ) : (
        <ul className="flex flex-col">{items.map((item) => renderRow?.(item))}</ul>
      )}

      {footer}
    </div>
  );
}
