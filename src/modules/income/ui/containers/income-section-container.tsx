"use client";

import dynamic from "next/dynamic";
import { useIncomeSection } from "../../application/use-income-section";
import { IncomeRow } from "../components/income-row";
import { httpExpensesRepository } from "@/modules/expenses/infrastructure/http-expenses-repository";
import { ItemSection } from "@/modules/expenses/ui/components/item-section";
import { ReorderableItemList } from "@/modules/expenses/ui/components/reorderable-item-list";
import { useActiveTemplateIds } from "@/modules/periods/application/use-active-template-ids";
import { useSelectedPeriod } from "@/modules/periods/application/use-selected-period";
import {
  httpPeriodsRepository,
  httpTemplatesRepository,
} from "@/modules/periods/infrastructure/http-periods-repository";
import { useTagList } from "@/modules/tags/application/use-tag-list";
import { httpTagsRepository } from "@/modules/tags/infrastructure/http-tags-repository";
import { useMessages } from "@/shared/i18n/use-i18n";
import { isPendingRow } from "@/shared/query/optimistic-rows";

const IncomeForm = dynamic(() => import("../components/income-form").then((module) => module.IncomeForm));

const NEW_INCOME = { name: "", amount: "", tagId: "", repeatsMonthly: false };

interface IncomeSectionContainerProps {
  period: string;
  tagId: string | null;
  onSessionEnded: () => void;
}

export function IncomeSectionContainer({ period, tagId, onSessionEnded }: IncomeSectionContainerProps) {
  const { common, income } = useMessages();
  const selected = useSelectedPeriod(httpPeriodsRepository, period);
  const { tags } = useTagList(httpTagsRepository);
  const isClosed = selected?.status === "closed";
  const activeTemplateIds = useActiveTemplateIds(httpTemplatesRepository);
  const section = useIncomeSection({
    repository: httpExpensesRepository,
    period,
    tagId,
    isClosed,
    onSessionEnded,
  });

  return (
    <ItemSection
      copy={income.copy}
      summary={section.toReceive}
      isFiltered={tagId !== null}
      isClosed={isClosed}
      items={section.items}
      notOpened={section.notOpened}
      isLoading={section.isLoading}
      loadFailed={section.loadFailed}
      refreshFailed={section.refreshFailed}
      totalsAreSettling={section.totalsAreSettling}
      failure={section.failure}
      reload={section.reload}
      renderItems={(sectionItems) => (
        <ReorderableItemList
          items={sectionItems}
          // A tag filter shows only some of the items, and an unconfirmed row has no id the API knows (D13).
          canReorder={tagId === null && sectionItems.length > 1 && !sectionItems.some(isPendingRow)}
          onReorder={(ids) => section.reorderItems("income", ids)}
          renderRow={(item, reorder) => (
            <IncomeRow
              key={item.id}
              item={item}
              tags={tags}
              reorder={reorder}
              repeats={item.templateId !== null && activeTemplateIds.has(item.templateId)}
              onSetDone={(done) => section.setDone(item.id, done)}
              onUpdate={(changes) => section.updateItem(item.id, changes)}
              onDelete={(stopRepeating) => section.deleteItem(item.id, stopRepeating)}
            />
          )}
        />
      )}
      renderAddForm={(close) => (
        <IncomeForm
          defaultValues={NEW_INCOME}
          tags={tags}
          submitLabel={common.save}
          pending={section.isCreating}
          repeatHint={income.repeatHint}
          onCancel={close}
          onSubmit={(draft) => section.createIncome(draft, { onSuccess: close })}
        />
      )}
    />
  );
}
