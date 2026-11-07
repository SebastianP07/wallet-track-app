import dynamic from "next/dynamic";
import { formatDueDate } from "../../domain/expense-groups";
import type { PeriodItem, PeriodItemUpdate } from "../../domain/types";
import { ItemRow } from "./item-row";
import { UrgencyBadge } from "./urgency-badge";
import { formatCopInput } from "@/modules/accounts/domain/money";
import type { Tag } from "@/modules/tags/domain/types";

const ExpenseForm = dynamic(() => import("./expense-form").then((module) => module.ExpenseForm));

interface ExpenseRowProps {
  item: PeriodItem;
  tags: Tag[];
  onSetDone: (done: boolean) => void;
  onUpdate: (changes: PeriodItemUpdate) => void;
  onDelete: () => void;
}

export function ExpenseRow({ item, tags, onSetDone, onUpdate, onDelete }: ExpenseRowProps) {
  return (
    <ItemRow
      item={item}
      tags={tags}
      doneWord="paid"
      onSetDone={onSetDone}
      onDelete={onDelete}
      details={
        <>
          {item.dueDate ? (
            <span className="text-xs whitespace-nowrap text-muted-foreground">
              Due {formatDueDate(item.dueDate, item.period)}
            </span>
          ) : null}
          <UrgencyBadge item={item} />
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
          submitLabel="Save changes"
          onCancel={close}
          onSubmit={(draft) => {
            onUpdate(draft);
            close();
          }}
        />
      )}
    />
  );
}
