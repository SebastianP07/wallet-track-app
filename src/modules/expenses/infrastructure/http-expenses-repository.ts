import type { ExpensesRepository } from "../application/expenses-repository";
import type { PeriodItem, PeriodItemList } from "../domain/types";
import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "@/shared/api/http-client";

const itemPath = (id: string) => `/period-items/${encodeURIComponent(id)}`;

export const httpExpensesRepository: ExpensesRepository = {
  list(period, tagId) {
    const query = tagId ? `?tagId=${encodeURIComponent(tagId)}` : "";
    return apiGet<PeriodItemList>(`/periods/${encodeURIComponent(period)}/items${query}`);
  },
  create(period, item) {
    return apiPost<PeriodItem>(`/periods/${encodeURIComponent(period)}/items`, item);
  },
  update(id, changes) {
    return apiPatch<PeriodItem>(itemPath(id), changes);
  },
  remove(id, stopRepeating) {
    return apiDelete(`${itemPath(id)}${stopRepeating ? "?stopRepeating=true" : ""}`);
  },
  markDone(id) {
    return apiPut<PeriodItem>(`${itemPath(id)}/done`);
  },
  unmarkDone(id) {
    return apiDelete<PeriodItem>(`${itemPath(id)}/done`);
  },
};
