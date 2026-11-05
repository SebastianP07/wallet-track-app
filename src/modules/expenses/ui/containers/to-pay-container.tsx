"use client";

import { useExpenseList } from "../../application/use-expense-list";
import { httpExpensesRepository } from "../../infrastructure/http-expenses-repository";
import { ToPaySummary } from "../components/to-pay-summary";

interface ToPayContainerProps {
  period: string;
  tagId: string | null;
  onSessionEnded: () => void;
}

export function ToPayContainer({ period, tagId, onSessionEnded }: ToPayContainerProps) {
  const expenseList = useExpenseList(httpExpensesRepository, period, tagId, onSessionEnded);
  return <ToPaySummary {...expenseList} />;
}
