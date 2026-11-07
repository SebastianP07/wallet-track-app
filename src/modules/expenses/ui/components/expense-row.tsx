import dynamic from "next/dynamic";
import { formatDueDate } from "../../domain/expense-groups";
import type { PeriodItem, PeriodItemUpdate } from "../../domain/types";
import { ItemRow } from "./item-row";
import { UrgencyBadge } from "./urgency-badge";
import { formatCopInput } from "@/modules/accounts/domain/money";
import { monthName, yearOf } from "@/modules/periods/domain/year-month";
import type { Tag } from "@/modules/tags/domain/types";

const ExpenseForm = dynamic(() => import("./expense-form").then((module) => module.ExpenseForm));

interface ExpenseRowProps {
  item: PeriodItem;
  tags: Tag[];
  onSetDone: (done: boolean) => void;
  repeats: boolean;
  onUpdate: (changes: PeriodItemUpdate) => void;
  onDelete: (stopRepeating: boolean) => void;
}

export function ExpenseRow({ item, tags, repeats, onSetDone, onUpdate, onDelete }: ExpenseRowProps) {
  return (
    <ItemRow
      item={item}
      tags={tags}
      repeats={repeats}
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
          {item.status === "overdue" && item.owedIn ? (
            <span className="text-xs whitespace-nowrap text-muted-foreground">
              Owed in {monthName(item.owedIn)} {yearOf(item.owedIn)}
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
          submitLabel="Save changes"
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
