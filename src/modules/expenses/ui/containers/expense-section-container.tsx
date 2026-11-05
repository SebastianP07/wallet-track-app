"use client";

import { useExpenseSection } from "../../application/use-expense-section";
import type { ExpenseKind } from "../../domain/types";
import { httpExpensesRepository } from "../../infrastructure/http-expenses-repository";
import { ExpenseSection } from "../components/expense-section";
import { useSelectedPeriod } from "@/modules/periods/application/use-selected-period";
import { httpPeriodsRepository } from "@/modules/periods/infrastructure/http-periods-repository";
import { useTagList } from "@/modules/tags/application/use-tag-list";
import { httpTagsRepository } from "@/modules/tags/infrastructure/http-tags-repository";

interface ExpenseSectionContainerProps {
  period: string;
  kind: ExpenseKind;
  tagId: string | null;
  onSessionEnded: () => void;
}

export function ExpenseSectionContainer({
  period,
  kind,
  tagId,
  onSessionEnded,
}: ExpenseSectionContainerProps) {
  const selected = useSelectedPeriod(httpPeriodsRepository, period);
  const { tags } = useTagList(httpTagsRepository);
  const isClosed = selected?.status === "closed";
  const section = useExpenseSection({
    repository: httpExpensesRepository,
    period,
    kind,
    tagId,
    isClosed,
    onSessionEnded,
  });
  return (
    <ExpenseSection kind={kind} isFiltered={tagId !== null} isClosed={isClosed} tags={tags} {...section} />
  );
}
