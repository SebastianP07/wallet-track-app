import dynamic from "next/dynamic";
import type { PeriodItem, PeriodItemUpdate } from "../../domain/types";
import { ItemRow } from "./item-row";
import type { RowReorder } from "./reorderable-item-list";
import { UrgencyBadge } from "./urgency-badge";
import { formatCopInput } from "@/modules/accounts/domain/money";
import { monthLabel } from "@/modules/periods/domain/year-month";
import { formatDate } from "@/shared/format/date";
import { useI18n } from "@/shared/i18n/use-i18n";
import type { Tag } from "@/modules/tags/domain/types";

const ExpenseForm = dynamic(() => import("./expense-form").then((module) => module.ExpenseForm));

interface ExpenseRowProps {
  item: PeriodItem;
  tags: Tag[];
  onSetDone: (done: boolean) => void;
  repeats: boolean;
  onUpdate: (changes: PeriodItemUpdate) => void;
  onDelete: (stopRepeating: boolean) => void;
  reorder?: RowReorder;
}

export function ExpenseRow({ item, tags, repeats, reorder, onSetDone, onUpdate, onDelete }: ExpenseRowProps) {
  const { locale, messages } = useI18n();
  const t = messages.expenses;
  return (
    <ItemRow
      item={item}
      tags={tags}
      repeats={repeats}
      doneWord="paid"
      onSetDone={onSetDone}
      onDelete={onDelete}
      reorder={reorder}
      details={
        <>
          {item.dueDate ? (
            <span className="text-xs whitespace-nowrap text-muted-foreground">
              {t.due(formatDate(item.dueDate))}
            </span>
          ) : null}
          <UrgencyBadge item={item} />
          {item.status === "overdue" && item.owedIn ? (
            <span className="text-xs whitespace-nowrap text-muted-foreground">
              {t.owedIn(monthLabel(item.owedIn, locale))}
            </span>
          ) : null}
        </>
      }
      renderEditForm={(close) => (
        <ExpenseForm
          defaultValues={{
            name: item.name,
            amount: formatCopInput(item.amount),
            dueDate: item.dueDate ?? "",
            tagId: item.tagId ?? "",
          }}
          tags={tags}
          submitLabel={t.saveChanges}
          onCancel={close}
          onSubmit={({ name, amount, dueDate, tagId }) => {
            onUpdate({ name, amount, dueDate, tagId });
            close();
          }}
        />
      )}
    />
  );
}
