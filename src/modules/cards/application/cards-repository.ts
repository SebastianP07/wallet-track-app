import type {
  CardChargeTotals,
  CreditCard,
  CreditCardCreate,
  CreditCardUpdate,
} from "../domain/types";

export interface CardsRepository {
  list(): Promise<CreditCard[]>;
  create(card: CreditCardCreate): Promise<CreditCard>;
  update(id: string, changes: CreditCardUpdate): Promise<CreditCard>;
  remove(id: string): Promise<void>;
  // Tags never affect these, so they take no filter (D5).
  totals(period: string): Promise<CardChargeTotals>;
}
