"use client";

import dynamic from "next/dynamic";
import { useIncomeSection } from "../../application/use-income-section";
import { INCOME_COPY } from "../../domain/income-copy";
import { IncomeRow } from "../components/income-row";
import { httpExpensesRepository } from "@/modules/expenses/infrastructure/http-expenses-repository";
import { ItemSection } from "@/modules/expenses/ui/components/item-section";
import { useSelectedPeriod } from "@/modules/periods/application/use-selected-period";
import { httpPeriodsRepository } from "@/modules/periods/infrastructure/http-periods-repository";
import { useTagList } from "@/modules/tags/application/use-tag-list";
import { httpTagsRepository } from "@/modules/tags/infrastructure/http-tags-repository";

const IncomeForm = dynamic(() => import("../components/income-form").then((module) => module.IncomeForm));

const NEW_INCOME = { name: "", amount: "", tagId: "" };

interface IncomeSectionContainerProps {
  period: string;
  tagId: string | null;
  onSessionEnded: () => void;
}

export function IncomeSectionContainer({ period, tagId, onSessionEnded }: IncomeSectionContainerProps) {
  const selected = useSelectedPeriod(httpPeriodsRepository, period);
  const { tags } = useTagList(httpTagsRepository);
  const isClosed = selected?.status === "closed";
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
          onSetDone={(done) => section.setDone(item.id, done)}
          onUpdate={(changes) => section.updateItem(item.id, changes)}
          onDelete={() => section.deleteItem(item.id)}
        />
      )}
      renderAddForm={(close) => (
        <IncomeForm
          defaultValues={NEW_INCOME}
          tags={tags}
          submitLabel="Save"
          pending={section.isCreating}
          onCancel={close}
          onSubmit={(draft) => section.createIncome(draft, { onSuccess: close })}
        />
      )}
    />
  );
}
