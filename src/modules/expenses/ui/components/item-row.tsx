"use client";

import { useState, type ReactNode } from "react";
import { cn } from "cn";

import type { PeriodItem } from "../../domain/types";
import { DoneToggle } from "./done-toggle";
import type { RowReorder } from "./reorderable-item-list";
import { formatCOP } from "@/modules/accounts/domain/money";
import type { Tag } from "@/modules/tags/domain/types";
import { monthLabel } from "@/modules/periods/domain/year-month";
import { useI18n } from "@/shared/i18n/use-i18n";
import { TagLabel } from "@/modules/tags/ui/components/tag-label";
import { isPendingRow } from "@/shared/query/optimistic-rows";
import { Button } from "@/shared/ui/button";
import { ConfirmPanel } from "@/shared/ui/confirm-panel";

const ACTION = "min-h-11 px-2 text-sm first:-ml-2";

type RowMode = "view" | "edit" | "confirm-delete";

interface ItemRowProps {
  item: PeriodItem;
  tags: Tag[];
  doneWord: "paid" | "received" | "charged";
  details: ReactNode;
  deleteNote?: string;
  // Its template still repeats it, so deleting asks whether later months should stop getting it too.
  repeats?: boolean;
  // A row without these has only its done toggle.
  renderEditForm?: (close: () => void) => ReactNode;
  onDelete?: (stopRepeating: boolean) => void;
  onSetDone: (done: boolean) => void;
  // Its handle and move buttons, in a list the owner can reorder (D13).
  reorder?: RowReorder;
}

export function ItemRow({
  item,
  tags,
  doneWord,
  details,
  deleteNote,
  repeats = false,
  renderEditForm,
  onSetDone,
  onDelete,
  reorder,
}: ItemRowProps) {
  const [mode, setMode] = useState<RowMode>("view");
  const { locale, messages } = useI18n();
  const t = messages.expenses;
  const pending = isPendingRow(item);
  const done = item.status === "done";
  const tag = tags.find(({ id }) => id === item.tagId);
  const toView = () => setMode("view");
  const remove = (stopRepeating: boolean) => {
    onDelete?.(stopRepeating);
    toView();
  };
  // Removal stays in the item's own month; the month that owes an overdue one stops counting it (D1, D7).
  const owedNote =
    item.status === "overdue" && item.owedIn
      ? t.owedMonthStops(monthLabel(item.owedIn, locale))
      : "";
  const note = deleteNote ?? (item.templateId ? t.templateStays : "");
  const doneNote = done ? t.doneMarkGoes(doneWord) : "";

  return (
    <li
      data-item-id={item.id}
      className="flex gap-3 border-t border-rule bg-background py-3 data-dragging:relative data-dragging:z-10 data-dragging:shadow-lg data-dragging:ring-1 data-dragging:ring-ring"
    >
      {reorder?.handle}
      <DoneToggle
        name={item.name}
        word={doneWord}
        done={done}
        disabled={pending}
        onToggle={() => onSetDone(!done)}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-3">
          <span className={cn("font-medium wrap-anywhere", done && "text-muted-foreground line-through")}>
            {item.name}
          </span>
          <span className="shrink-0 text-right font-mono text-sm leading-6 whitespace-nowrap">
            {formatCOP(item.amount)}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {details}
          {tag ? <TagLabel name={tag.name} color={tag.color} /> : null}
        </div>

        {mode === "view" && renderEditForm && onDelete ? (
          <div className="flex flex-wrap items-center">
            <Button
              variant="link"
              className={ACTION}
              disabled={pending}
              aria-label={t.editItem(item.name)}
              onClick={() => setMode("edit")}
            >
              {messages.common.edit}
            </Button>
            <Button
              variant="link"
              className={ACTION}
              disabled={pending}
              aria-label={t.deleteItem(item.name)}
              onClick={() => setMode("confirm-delete")}
            >
              {messages.common.delete}
            </Button>
          </div>
        ) : null}

        {mode === "view" ? reorder?.controls : null}

        {mode === "edit" ? renderEditForm?.(toView) : null}

        {mode === "confirm-delete" && repeats ? (
          <ConfirmPanel
            confirmLabel={t.onlyThisMonth}
            confirmAriaLabel={t.onlyThisMonthAria(item.name)}
            alternative={{
              label: t.stopRepeating,
              ariaLabel: t.stopRepeatingAria(item.name),
              onSelect: () => remove(true),
            }}
            onConfirm={() => remove(false)}
            onKeep={toView}
          >
            <span className="font-medium wrap-anywhere">{item.name}</span>
            {t.repeatsConfirm}
            {doneNote}
            {owedNote}
          </ConfirmPanel>
        ) : null}

        {mode === "confirm-delete" && !repeats ? (
          <ConfirmPanel confirmLabel={messages.common.delete} onConfirm={() => remove(false)} onKeep={toView}>
            {t.deleteFromMonthBefore}
            <span className="font-medium wrap-anywhere">{item.name}</span>
            {t.deleteFromMonthAfter}{" "}
            {note}
            {doneNote}
            {owedNote}
          </ConfirmPanel>
        ) : null}
      </div>
    </li>
  );
}
