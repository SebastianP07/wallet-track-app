import dynamic from "next/dynamic";
import { cn } from "cn";

import type { CreditCard } from "../../domain/types";
import { formatCopInput } from "@/modules/accounts/domain/money";
import type { PeriodItem, PeriodItemUpdate } from "@/modules/expenses/domain/types";
import { ItemRow } from "@/modules/expenses/ui/components/item-row";
import { BADGE } from "@/modules/expenses/ui/components/urgency-badge";
import type { Tag } from "@/modules/tags/domain/types";
import { useMessages } from "@/shared/i18n/use-i18n";

const CardChargeForm = dynamic(() => import("./card-charge-form").then((module) => module.CardChargeForm));

interface CardChargeRowProps {
  item: PeriodItem;
  cards: CreditCard[];
  tags: Tag[];
  onSetDone: (done: boolean) => Promise<unknown>;
  onUpdate: (changes: PeriodItemUpdate) => void;
  onDelete: () => void;
}

export function CardChargeRow({ item, cards, tags, onSetDone, onUpdate, onDelete }: CardChargeRowProps) {
  const { cards: t, expenses } = useMessages();
  const status = (
    <span className={cn(BADGE, "border-rule text-muted-foreground")}>
      {item.status === "done" ? t.charged : t.expected}
    </span>
  );
  // A platform's charge follows its platform, so it is edited or removed there and only marked here (D14).
  if (item.platformId) {
    return (
      <ItemRow
        item={item}
        tags={tags}
        doneWord="charged"
        onSetDone={onSetDone}
        details={
          <>
            {status}
            <span className={cn(BADGE, "border-signal text-signal")}>{t.fromPlatform}</span>
            <span className="text-xs text-muted-foreground">{t.fromPlatformHint}</span>
          </>
        }
      />
    );
  }
  return (
    <ItemRow
      item={item}
      tags={tags}
      doneWord="charged"
      onSetDone={onSetDone}
      onDelete={onDelete}
      details={status}
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
          submitLabel={expenses.saveChanges}
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
