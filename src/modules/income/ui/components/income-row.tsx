import dynamic from "next/dynamic";
import { IncomeStatusBadge } from "./income-status-badge";
import { formatCopInput } from "@/modules/accounts/domain/money";
import type { PeriodItem, PeriodItemUpdate } from "@/modules/expenses/domain/types";
import { ItemRow } from "@/modules/expenses/ui/components/item-row";
import type { RowReorder } from "@/modules/expenses/ui/components/reorderable-item-list";
import type { Tag } from "@/modules/tags/domain/types";
import { useMessages } from "@/shared/i18n/use-i18n";

const IncomeForm = dynamic(() => import("./income-form").then((module) => module.IncomeForm));

interface IncomeRowProps {
  item: PeriodItem;
  tags: Tag[];
  onSetDone: (done: boolean) => void;
  repeats: boolean;
  onUpdate: (changes: PeriodItemUpdate) => void;
  onDelete: (stopRepeating: boolean) => void;
  reorder?: RowReorder;
}

export function IncomeRow({ item, tags, repeats, reorder, onSetDone, onUpdate, onDelete }: IncomeRowProps) {
  const { income: t, expenses } = useMessages();
  return (
    <ItemRow
      item={item}
      tags={tags}
      repeats={repeats}
      doneWord="received"
      onSetDone={onSetDone}
      onDelete={onDelete}
      reorder={reorder}
      deleteNote={item.personId ? t.platformDeleteNote : undefined}
      details={
        <>
          <IncomeStatusBadge status={item.status} />
          {item.personId ? (
            <span className="text-xs whitespace-nowrap text-muted-foreground">{t.sharedPlatforms}</span>
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
          submitLabel={expenses.saveChanges}
          onCancel={close}
          onSubmit={({ name, amount, tagId }) => {
            onUpdate({ name, amount, tagId });
            close();
          }}
        />
      )}
    />
  );
}
