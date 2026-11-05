"use client";

import { EXPENSE_COPY } from "../../domain/expense-groups";
import type { ExpenseDraft } from "../../domain/expense-forms";
import type { ExpenseKind, PeriodItem, PeriodItemUpdate } from "../../domain/types";
import { ExpenseForm } from "./expense-form";
import { ExpenseRow } from "./expense-row";
import { ItemSection } from "./item-section";
import type { Tag } from "@/modules/tags/domain/types";

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
  tags,
  toPay,
  isCreating,
  createExpense,
  updateExpense,
  deleteExpense,
  setDone,
  isFiltered,
  isClosed,
  items,
  notOpened,
  isLoading,
  loadFailed,
  refreshFailed,
  totalsAreSettling,
  failure,
  reload,
}: ExpenseSectionProps) {
  return (
    <ItemSection
      copy={EXPENSE_COPY[kind]}
      summary={toPay}
      isFiltered={isFiltered}
      isClosed={isClosed}
      items={items}
      notOpened={notOpened}
      isLoading={isLoading}
      loadFailed={loadFailed}
      refreshFailed={refreshFailed}
      totalsAreSettling={totalsAreSettling}
      failure={failure}
      reload={reload}
      renderRow={(item) => (
        <ExpenseRow
          key={item.id}
          item={item}
          tags={tags}
          onSetDone={(done) => setDone(item.id, done)}
          onUpdate={(changes) => updateExpense(item.id, changes)}
          onDelete={() => deleteExpense(item.id)}
        />
      )}
      renderAddForm={(close) => (
        <ExpenseForm
          defaultValues={NEW_EXPENSE}
          tags={tags}
          submitLabel="Save"
          pending={isCreating}
          onCancel={close}
          onSubmit={(draft) => createExpense(draft, { onSuccess: close })}
        />
      )}
    />
  );
}
