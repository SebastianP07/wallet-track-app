"use client";

import dynamic from "next/dynamic";
import type { ExpenseDraft } from "../../domain/expense-forms";
import type { ExpenseKind, PeriodItem, PeriodItemUpdate } from "../../domain/types";
import { ExpenseRow } from "./expense-row";
import { ItemSection } from "./item-section";
import { ReorderableItemList } from "./reorderable-item-list";
import { isPendingRow } from "@/shared/query/optimistic-rows";
import { lastDayOf } from "@/modules/periods/domain/year-month";
import type { Tag } from "@/modules/tags/domain/types";
import { useMessages } from "@/shared/i18n/use-i18n";

const ExpenseForm = dynamic(() => import("./expense-form").then((module) => module.ExpenseForm));

// A fixed expense repeats unless the owner says otherwise. An occasional one is due by the month's end unless
// another date is chosen, so only its name and amount are needed.
function newExpense(kind: ExpenseKind, period: string) {
  return kind === "fixed"
    ? { name: "", amount: "", dueDate: "", tagId: "", repeatsMonthly: true }
    : { name: "", amount: "", dueDate: lastDayOf(period), tagId: "", repeatsMonthly: false };
}

interface ExpenseSectionProps {
  kind: ExpenseKind;
  period: string;
  activeTemplateIds: ReadonlySet<string>;
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
  deleteExpense: (id: string, stopRepeating: boolean) => void;
  setDone: (id: string, done: boolean) => void;
  reorderItems: (kind: ExpenseKind, ids: string[]) => void;
}

export function ExpenseSection({
  kind,
  period,
  activeTemplateIds,
  tags,
  toPay,
  isCreating,
  createExpense,
  updateExpense,
  deleteExpense,
  setDone,
  reorderItems,
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
  const { common, expenses } = useMessages();
  return (
    <ItemSection
      copy={expenses.copy[kind]}
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
      renderItems={(sectionItems) => (
        <ReorderableItemList
          items={sectionItems}
          // A tag filter shows only some of the items, and an unconfirmed row has no id the API knows (D13).
          canReorder={!isFiltered && sectionItems.length > 1 && !sectionItems.some(isPendingRow)}
          onReorder={(ids) => reorderItems(kind, ids)}
          renderRow={(item, reorder) => (
            <ExpenseRow
              key={item.id}
              item={item}
              tags={tags}
              reorder={reorder}
              repeats={item.templateId !== null && activeTemplateIds.has(item.templateId)}
              onSetDone={(done) => setDone(item.id, done)}
              onUpdate={(changes) => updateExpense(item.id, changes)}
              onDelete={(stopRepeating) => deleteExpense(item.id, stopRepeating)}
            />
          )}
        />
      )}
      renderAddForm={(close) => (
        <ExpenseForm
          defaultValues={newExpense(kind, period)}
          tags={tags}
          submitLabel={common.save}
          pending={isCreating}
          repeatHint={kind === "fixed" ? expenses.repeatHintFixed : undefined}
          onCancel={close}
          onSubmit={(draft) => createExpense(draft, { onSuccess: close })}
        />
      )}
    />
  );
}
