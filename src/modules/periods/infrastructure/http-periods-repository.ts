import type { PeriodsRepository, TemplatesRepository } from "../application/periods-repository";
import type { Period, PeriodList, Template, TemplateList } from "../domain/types";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/shared/api/http-client";
import type { components } from "@/shared/api/openapi";

export const httpPeriodsRepository: PeriodsRepository = {
  list() {
    return apiGet<PeriodList>("/periods");
  },
  open(period) {
    return apiPost<Period>("/periods", { period });
  },
  close(period) {
    return apiPost<Period>(`/periods/${encodeURIComponent(period)}/close`);
  },
};

export const httpTemplatesRepository: TemplatesRepository = {
  list() {
    return apiGet<TemplateList>("/recurring-templates");
  },
  create(template) {
    return apiPost<Template>("/recurring-templates", template);
  },
  update(id, changes) {
    return apiPatch<Template>(`/recurring-templates/${encodeURIComponent(id)}`, changes);
  },
  remove(id) {
    return apiDelete(`/recurring-templates/${encodeURIComponent(id)}`);
  },
  async listCards() {
    const { items } = await apiGet<components["schemas"]["CreditCardList"]>("/credit-cards");
    return items;
  },
};
