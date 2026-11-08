"use client";

import dynamic from "next/dynamic";
import { useCardChargeSection } from "../../application/use-card-charge-section";
import { useCardSection } from "../../application/use-card-section";
import { groupByCard } from "../../domain/card-groups";
import { httpCardsRepository } from "../../infrastructure/http-cards-repository";
import { CardChargeRow } from "../components/card-charge-row";
import { CardGroupsList } from "../components/card-groups-list";
import { CardManager } from "../components/card-manager";
import type { PeriodItem } from "@/modules/expenses/domain/types";
import { httpExpensesRepository } from "@/modules/expenses/infrastructure/http-expenses-repository";
import { ItemSection } from "@/modules/expenses/ui/components/item-section";
import { useSelectedPeriod } from "@/modules/periods/application/use-selected-period";
import { httpPeriodsRepository } from "@/modules/periods/infrastructure/http-periods-repository";
import { useTagList } from "@/modules/tags/application/use-tag-list";
import { httpTagsRepository } from "@/modules/tags/infrastructure/http-tags-repository";
import { useMessages } from "@/shared/i18n/use-i18n";

const CardChargeForm = dynamic(() => import("../components/card-charge-form").then((module) => module.CardChargeForm));

const NEW_CHARGE = { name: "", amount: "", cardId: "", tagId: "" };

interface CardChargeSectionContainerProps {
  period: string;
  tagId: string | null;
  onSessionEnded: () => void;
}

export function CardChargeSectionContainer({
  period,
  tagId,
  onSessionEnded,
}: CardChargeSectionContainerProps) {
  const { common, cards: t } = useMessages();
  const selected = useSelectedPeriod(httpPeriodsRepository, period);
  const { tags } = useTagList(httpTagsRepository);
  const isClosed = selected?.status === "closed";
  const isFiltered = tagId !== null;
  const section = useCardChargeSection({
    repository: httpExpensesRepository,
    cardsRepository: httpCardsRepository,
    period,
    tagId,
    isClosed,
    onSessionEnded,
  });
  const cardSection = useCardSection(httpCardsRepository, onSessionEnded);
  const { cards } = cardSection;

  const renderRow = (item: PeriodItem) => (
    <CardChargeRow
      key={item.id}
      item={item}
      cards={cards}
      tags={tags}
      onSetDone={(done) => section.setDone(item.id, done)}
      onUpdate={(changes) => section.updateItem(item.id, changes)}
      onDelete={() => section.deleteItem(item.id)}
    />
  );

  return (
    <div className="flex flex-1 flex-col gap-4">
      <p className="border-l-2 border-signal pl-3 text-sm">
        {t.informational}
      </p>
      <ItemSection
        copy={t.chargeCopy}
        summary={section.totals?.total ?? null}
        isFiltered={isFiltered}
        isClosed={isClosed}
        items={section.items}
        notOpened={section.notOpened}
        isLoading={section.isLoading}
        loadFailed={section.loadFailed}
        refreshFailed={section.refreshFailed}
        totalsAreSettling={section.totalsAreSettling}
        failure={section.failure}
        reload={section.reload}
        renderRow={renderRow}
        renderItems={(items) => (
          <CardGroupsList
            groups={groupByCard({
              items,
              totals: section.totals?.items ?? [],
              cards,
              isFiltered,
              deletedCardTitle: t.deletedCard,
            })}
            isFiltered={isFiltered}
            totalsLoadFailed={section.totalsLoadFailed}
            totalsAreSettling={section.totalsAreSettling}
            reloadTotals={section.reloadTotals}
            renderRow={renderRow}
          />
        )}
        renderAddForm={(close) => (
          <CardChargeForm
            defaultValues={NEW_CHARGE}
            cards={cards}
            cardIsRequired
            tags={tags}
            submitLabel={common.save}
            pending={section.isCreating}
            onCancel={close}
            onSubmit={(draft) => section.createCharge(draft, { onSuccess: close })}
          />
        )}
      />
      <CardManager {...cardSection} />
    </div>
  );
}
