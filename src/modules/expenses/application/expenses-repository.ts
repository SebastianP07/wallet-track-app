import type { ItemCreate, PeriodItem, PeriodItemList, PeriodItemUpdate } from "../domain/types";

export interface ExpensesRepository {
  // Totals in the answer always cover the whole month, whatever the tag (D5).
  list(period: string, tagId: string | null): Promise<PeriodItemList>;
  create(period: string, item: ItemCreate): Promise<PeriodItem>;
  update(id: string, changes: PeriodItemUpdate): Promise<PeriodItem>;
  remove(id: string): Promise<void>;
  markDone(id: string): Promise<PeriodItem>;
  unmarkDone(id: string): Promise<PeriodItem>;
}
