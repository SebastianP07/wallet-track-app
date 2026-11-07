import type { OverdueRepository } from "../application/overdue-repository";
import type { OverdueItemList } from "../domain/types";
import { httpExpensesRepository } from "@/modules/expenses/infrastructure/http-expenses-repository";
import { apiGet } from "@/shared/api/http-client";

export const httpOverdueRepository: OverdueRepository = {
  list(period) {
    return apiGet<OverdueItemList>(`/periods/${period}/overdue-items`);
  },
  markDone: httpExpensesRepository.markDone,
};
