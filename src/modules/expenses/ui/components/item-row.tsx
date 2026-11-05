"use client";

import { useState, type ReactNode } from "react";
import { cn } from "cn";

import type { PeriodItem } from "../../domain/types";
import { DoneToggle } from "./done-toggle";
import { formatCOP } from "@/modules/accounts/domain/money";
import type { Tag } from "@/modules/tags/domain/types";
import { TagLabel } from "@/modules/tags/ui/components/tag-label";
import { isPendingRow } from "@/shared/query/optimistic-rows";
import { Button } from "@/shared/ui/button";

const ACTION = "min-h-11 px-2 text-sm first:-ml-2";

type RowMode = "view" | "edit" | "confirm-delete";

interface ItemRowProps {
  item: PeriodItem;
  tags: Tag[];
  doneWord: "paid" | "received" | "charged";
  details: ReactNode;
  deleteNote?: string;
  renderEditForm: (close: () => void) => ReactNode;
  onSetDone: (done: boolean) => void;
  onDelete: () => void;
}

export function ItemRow({
  item,
  tags,
  doneWord,
  details,
  deleteNote = "Its template, if it has one, stays.",
  renderEditForm,
  onSetDone,
  onDelete,
}: ItemRowProps) {
  const [mode, setMode] = useState<RowMode>("view");
  const pending = isPendingRow(item);
  const done = item.status === "done";
  const tag = tags.find(({ id }) => id === item.tagId);
  const toView = () => setMode("view");

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

        {mode === "view" ? (
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

        {mode === "edit" ? renderEditForm(toView) : null}

        {mode === "confirm-delete" ? (
          <div className="flex flex-col gap-2 pt-1">
            <p className="text-sm">
              Delete <span className="font-medium wrap-anywhere">{item.name}</span> from this month?{" "}
              {deleteNote}
            </p>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => {
                  onDelete();
                  toView();
                }}
              >
                Delete
              </Button>
              <Button variant="outline" className="flex-1" onClick={toView}>
                Keep it
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </li>
  );
}
