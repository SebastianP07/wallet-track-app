"use client";

import dynamic from "next/dynamic";
import { useIncomeSection } from "../../application/use-income-section";
import { INCOME_COPY } from "../../domain/income-copy";
import { IncomeRow } from "../components/income-row";
import { httpExpensesRepository } from "@/modules/expenses/infrastructure/http-expenses-repository";
import { ItemSection } from "@/modules/expenses/ui/components/item-section";
import { useActiveTemplateIds } from "@/modules/periods/application/use-active-template-ids";
import { useSelectedPeriod } from "@/modules/periods/application/use-selected-period";
import {
  httpPeriodsRepository,
  httpTemplatesRepository,
} from "@/modules/periods/infrastructure/http-periods-repository";
import { useTagList } from "@/modules/tags/application/use-tag-list";
import { httpTagsRepository } from "@/modules/tags/infrastructure/http-tags-repository";

const IncomeForm = dynamic(() => import("../components/income-form").then((module) => module.IncomeForm));

const NEW_INCOME = { name: "", amount: "", tagId: "", repeatsMonthly: false };

const REPEAT_HINT = "Every month you open from now on gets it too, like a salary. Leave it unticked for this month only.";

interface IncomeSectionContainerProps {
  period: string;
  tagId: string | null;
  onSessionEnded: () => void;
}

export function IncomeSectionContainer({ period, tagId, onSessionEnded }: IncomeSectionContainerProps) {
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
      copy={INCOME_COPY}
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
      renderRow={(item) => (
        <IncomeRow
          key={item.id}
          item={item}
          tags={tags}
          repeats={item.templateId !== null && activeTemplateIds.has(item.templateId)}
          onSetDone={(done) => section.setDone(item.id, done)}
          onUpdate={(changes) => section.updateItem(item.id, changes)}
          onDelete={(stopRepeating) => section.deleteItem(item.id, stopRepeating)}
        />
      )}
      renderAddForm={(close) => (
        <IncomeForm
          defaultValues={NEW_INCOME}
          tags={tags}
          submitLabel="Save"
          pending={section.isCreating}
          repeatHint={REPEAT_HINT}
          onCancel={close}
          onSubmit={(draft) => section.createIncome(draft, { onSuccess: close })}
        />
      )}
    />
  );
}
