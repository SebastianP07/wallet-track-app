import dynamic from "next/dynamic";
import { IncomeStatusBadge } from "./income-status-badge";
import { formatCopInput } from "@/modules/accounts/domain/money";
import type { PeriodItem, PeriodItemUpdate } from "@/modules/expenses/domain/types";
import { ItemRow } from "@/modules/expenses/ui/components/item-row";
import type { Tag } from "@/modules/tags/domain/types";

const IncomeForm = dynamic(() => import("./income-form").then((module) => module.IncomeForm));

const PLATFORM_ITEM_DELETE_NOTE =
  "A payment recorded for it stays, with its coverage. Opening the month again won't bring this item back.";

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
      deleteNote={item.personId ? PLATFORM_ITEM_DELETE_NOTE : undefined}
      details={
        <>
          <IncomeStatusBadge status={item.status} />
          {item.personId ? (
            <span className="text-xs whitespace-nowrap text-muted-foreground">Shared platforms</span>
          ) : null}
        </>
      }
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
