"use client";

import { useState, type ReactNode } from "react";
import { cn } from "cn";

import type { PeriodItem } from "../../domain/types";
import { DoneToggle } from "./done-toggle";
import { formatCOP } from "@/modules/accounts/domain/money";
import type { Tag } from "@/modules/tags/domain/types";
import { monthName, yearOf } from "@/modules/periods/domain/year-month";
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
}: ItemRowProps) {
  const [mode, setMode] = useState<RowMode>("view");
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
      ? ` ${monthName(item.owedIn)} ${yearOf(item.owedIn)}, which owes it, stops counting it.`
      : "";
  const note = deleteNote ?? (item.templateId ? "Its template stays as it is." : "");
  const doneNote = done ? ` It is marked ${doneWord} here, and that mark goes with it.` : "";

  return (
    <li className="flex gap-3 border-t border-rule py-3">
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
              aria-label={`Edit ${item.name}`}
              onClick={() => setMode("edit")}
            >
              Edit
            </Button>
            <Button
              variant="link"
              className={ACTION}
              disabled={pending}
              aria-label={`Delete ${item.name}`}
              onClick={() => setMode("confirm-delete")}
            >
              Delete
            </Button>
          </div>
        ) : null}

        {mode === "edit" ? renderEditForm?.(toView) : null}

        {mode === "confirm-delete" && repeats ? (
          <ConfirmPanel
            confirmLabel="Only this month"
            confirmAriaLabel={`Delete ${item.name} from this month only`}
            alternative={{
              label: "Stop repeating too",
              ariaLabel: `Delete ${item.name} and stop repeating it`,
              onSelect: () => remove(true),
            }}
            onConfirm={() => remove(false)}
            onKeep={toView}
          >
            <span className="font-medium wrap-anywhere">{item.name}</span> repeats every month. Delete it from
            this month only, so months opened later still get it, or also stop repeating it. Earlier months keep
            theirs, paid or not.{doneNote}
            {owedNote}
          </ConfirmPanel>
        ) : null}

        {mode === "confirm-delete" && !repeats ? (
          <ConfirmPanel confirmLabel="Delete" onConfirm={() => remove(false)} onKeep={toView}>
            Delete <span className="font-medium wrap-anywhere">{item.name}</span> from this month?{" "}
            {note}
            {doneNote}
            {owedNote}
          </ConfirmPanel>
        ) : null}
      </div>
    </li>
  );
}
