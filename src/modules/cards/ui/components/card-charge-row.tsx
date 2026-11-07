import dynamic from "next/dynamic";
import { cn } from "cn";

import type { CreditCard } from "../../domain/types";
import { formatCopInput } from "@/modules/accounts/domain/money";
import type { PeriodItem, PeriodItemUpdate } from "@/modules/expenses/domain/types";
import { ItemRow } from "@/modules/expenses/ui/components/item-row";
import { BADGE } from "@/modules/expenses/ui/components/urgency-badge";
import type { Tag } from "@/modules/tags/domain/types";

const CardChargeForm = dynamic(() => import("./card-charge-form").then((module) => module.CardChargeForm));

interface CardChargeRowProps {
  item: PeriodItem;
  cards: CreditCard[];
  tags: Tag[];
  onSetDone: (done: boolean) => void;
  onUpdate: (changes: PeriodItemUpdate) => void;
  onDelete: () => void;
}

export function CardChargeRow({ item, cards, tags, onSetDone, onUpdate, onDelete }: CardChargeRowProps) {
  return (
    <ItemRow
      item={item}
      tags={tags}
      doneWord="charged"
      onSetDone={onSetDone}
      onDelete={onDelete}
      details={
        <span className={cn(BADGE, "border-rule text-muted-foreground")}>
          {item.status === "done" ? "Charged" : "Expected"}
        </span>
      }
      renderEditForm={(close) => (
        <CardChargeForm
          defaultValues={{
            name: item.name,
            amount: formatCopInput(item.amount),
            cardId: item.cardId ?? "",
            tagId: item.tagId ?? "",
          }}
          cards={cards}
          cardIsRequired={item.cardId !== null}
          tags={tags}
          submitLabel="Save changes"
          onCancel={close}
          onSubmit={({ cardId, ...rest }) => {
            onUpdate(cardId ? { ...rest, cardId } : rest);
            close();
          }}
        />
      )}
    />
  );
}
