import type { CardsRepository } from "../application/cards-repository";
import type { CardChargeTotals, CreditCard, CreditCardList } from "../domain/types";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/shared/api/http-client";

const cardPath = (id: string) => `/credit-cards/${encodeURIComponent(id)}`;

export const httpCardsRepository: CardsRepository = {
  async list() {
    const { items } = await apiGet<CreditCardList>("/credit-cards");
    return items;
  },
  create(card) {
    return apiPost<CreditCard>("/credit-cards", card);
  },
  update(id, changes) {
    return apiPatch<CreditCard>(cardPath(id), changes);
  },
  remove(id) {
    return apiDelete(cardPath(id));
  },
  totals(period) {
    return apiGet<CardChargeTotals>(`/periods/${encodeURIComponent(period)}/card-totals`);
  },
};
