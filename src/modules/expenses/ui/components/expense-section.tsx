"use client";

import { useState } from "react";
import { cn } from "cn";

import { EXPENSE_COPY } from "../../domain/expense-groups";
import type { ExpenseDraft } from "../../domain/expense-forms";
import type { ExpenseKind, PeriodItem, PeriodItemUpdate } from "../../domain/types";
import { ExpenseForm } from "./expense-form";
import { ExpenseRow } from "./expense-row";
import { formatCOP } from "@/modules/accounts/domain/money";
import type { Tag } from "@/modules/tags/domain/types";
import { Button } from "@/shared/ui/button";
import { FormAlert } from "@/shared/ui/form-alert";

const NEW_EXPENSE = { name: "", amount: "", dueDate: "", tagId: "" };

interface ExpenseSectionProps {
  kind: ExpenseKind;
  isFiltered: boolean;
  isClosed: boolean;
  tags: Tag[];
  items: PeriodItem[];
  toPay: number | null;
  notOpened: boolean;
  isLoading: boolean;
  loadFailed: boolean;
  refreshFailed: boolean;
  totalsAreSettling: boolean;
  isCreating: boolean;
  failure: string | null;
  reload: () => void;
  createExpense: (draft: ExpenseDraft, callbacks: { onSuccess: () => void }) => void;
  updateExpense: (id: string, changes: PeriodItemUpdate) => void;
  deleteExpense: (id: string) => void;
  setDone: (id: string, done: boolean) => void;
}

export function ExpenseSection({
  kind,
  isFiltered,
  isClosed,
  tags,
  items,
  toPay,
  notOpened,
  isLoading,
  loadFailed,
  refreshFailed,
  totalsAreSettling,
  isCreating,
  failure,
  reload,
  createExpense,
  updateExpense,
  deleteExpense,
  setDone,
}: ExpenseSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const copy = EXPENSE_COPY[kind];

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
        <FormAlert message="These expenses could not be loaded." />
        <Button variant="outline" onClick={reload}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-3">
      <FormAlert message={failure} />
      {refreshFailed ? (
        <p className="text-sm text-muted-foreground">
          Showing the last expenses received; they could not be refreshed.
        </p>
      ) : null}

      {toPay !== null ? (
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm text-muted-foreground">To pay</span>
          <span
            className={cn(
              "font-mono text-lg transition-opacity",
              totalsAreSettling && "opacity-60",
            )}
          >
            {formatCOP(toPay)}
          </span>
        </div>
      ) : null}

      {items.length === 0 ? (
        <p className="border-t border-rule py-3 text-sm text-muted-foreground">
          {isFiltered ? copy.filtered : copy.empty}
        </p>
      ) : (
        <ul className="flex flex-col">
          {items.map((item) => (
            <ExpenseRow
              key={item.id}
              item={item}
              tags={tags}
              onSetDone={(done) => setDone(item.id, done)}
              onUpdate={(changes) => updateExpense(item.id, changes)}
              onDelete={() => deleteExpense(item.id)}
            />
          ))}
        </ul>
      )}

      {isClosed ? (
        <p className="mt-auto text-sm text-muted-foreground">
          This month is closed, so it takes no new items. Its items can still be paid, edited or
          deleted.
        </p>
      ) : isAdding ? (
        <div className="border-t border-rule pt-3">
          <ExpenseForm
            defaultValues={NEW_EXPENSE}
            tags={tags}
            submitLabel="Save"
            pending={isCreating}
            onCancel={() => setIsAdding(false)}
            onSubmit={(draft) => createExpense(draft, { onSuccess: () => setIsAdding(false) })}
          />
        </div>
      ) : (
        <Button variant="outline" className="mt-auto lg:self-start" onClick={() => setIsAdding(true)}>
          {copy.add}
        </Button>
      )}
    </div>
  );
}
