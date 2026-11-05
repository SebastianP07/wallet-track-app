import { IncomeForm } from "./income-form";
import { IncomeStatusBadge } from "./income-status-badge";
import { formatCopInput } from "@/modules/accounts/domain/money";
import type { PeriodItem, PeriodItemUpdate } from "@/modules/expenses/domain/types";
import { ItemRow } from "@/modules/expenses/ui/components/item-row";
import type { Tag } from "@/modules/tags/domain/types";

interface IncomeRowProps {
  item: PeriodItem;
  tags: Tag[];
  onSetDone: (done: boolean) => void;
  onUpdate: (changes: PeriodItemUpdate) => void;
  onDelete: () => void;
}

export function IncomeRow({ item, tags, onSetDone, onUpdate, onDelete }: IncomeRowProps) {
  return (
    <ItemRow
      item={item}
      tags={tags}
      doneWord="received"
      onSetDone={onSetDone}
      onDelete={onDelete}
      details={<IncomeStatusBadge status={item.status} />}
      renderEditForm={(close) => (
        <IncomeForm
          defaultValues={{
            name: item.name,
            amount: formatCopInput(item.amount),
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
