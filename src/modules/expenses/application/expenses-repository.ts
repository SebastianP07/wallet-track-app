import type { ItemCreate, PeriodItem, PeriodItemList, PeriodItemUpdate } from "../domain/types";

export interface ExpensesRepository {
  // Totals in the answer always cover the whole month, whatever the tag (D5).
  list(period: string, tagId: string | null): Promise<PeriodItemList>;
  create(period: string, item: ItemCreate): Promise<PeriodItem>;
  update(id: string, changes: PeriodItemUpdate): Promise<PeriodItem>;
  // stopRepeating also stops the item's template, in the same write.
  remove(id: string, stopRepeating: boolean): Promise<void>;
  markDone(id: string): Promise<PeriodItem>;
  unmarkDone(id: string): Promise<PeriodItem>;
}
