"use client";

import { useState } from "react";
import { cn } from "cn";

import { formatDueDate } from "../../domain/expense-groups";
import type { PeriodItem, PeriodItemUpdate } from "../../domain/types";
import { ExpenseForm } from "./expense-form";
import { PaidToggle } from "./paid-toggle";
import { UrgencyBadge } from "./urgency-badge";
import { formatCOP, formatCopInput } from "@/modules/accounts/domain/money";
import type { Tag } from "@/modules/tags/domain/types";
import { TagLabel } from "@/modules/tags/ui/components/tag-label";
import { isPendingRow } from "@/shared/query/optimistic-rows";
import { Button } from "@/shared/ui/button";

const ACTION = "min-h-11 px-2 text-sm first:-ml-2";

type RowMode = "view" | "edit" | "confirm-delete";

interface ExpenseRowProps {
  item: PeriodItem;
  tags: Tag[];
  onSetDone: (done: boolean) => void;
  onUpdate: (changes: PeriodItemUpdate) => void;
  onDelete: () => void;
}

export function ExpenseRow({ item, tags, onSetDone, onUpdate, onDelete }: ExpenseRowProps) {
  const [mode, setMode] = useState<RowMode>("view");
  const pending = isPendingRow(item);
  const paid = item.status === "done";
  const tag = tags.find(({ id }) => id === item.tagId);
  const toView = () => setMode("view");

  return (
    <li className="flex gap-3 border-t border-rule py-3">
      <PaidToggle
        name={item.name}
        paid={paid}
        disabled={pending}
        onToggle={() => onSetDone(!paid)}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-3">
          <span className={cn("font-medium wrap-anywhere", paid && "text-muted-foreground line-through")}>
            {item.name}
          </span>
          <span className="shrink-0 text-right font-mono text-sm leading-6 whitespace-nowrap">
            {formatCOP(item.amount)}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {item.dueDate ? (
            <span className="text-xs whitespace-nowrap text-muted-foreground">
              Due {formatDueDate(item.dueDate, item.period)}
            </span>
          ) : null}
          <UrgencyBadge item={item} />
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

        {mode === "edit" ? (
          <ExpenseForm
            defaultValues={{
              name: item.name,
              amount: formatCopInput(item.amount),
              dueDate: item.dueDate ?? "",
              tagId: item.tagId ?? "",
            }}
            tags={tags}
            submitLabel="Save changes"
            onCancel={toView}
            onSubmit={(draft) => {
              onUpdate(draft);
              toView();
            }}
          />
        ) : null}

        {mode === "confirm-delete" ? (
          <div className="flex flex-col gap-2 pt-1">
            <p className="text-sm">
              Delete <span className="font-medium wrap-anywhere">{item.name}</span> from this month?
              Its template, if it has one, stays.
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
