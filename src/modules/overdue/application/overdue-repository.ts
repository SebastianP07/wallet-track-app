import type { OverdueItemList } from "../domain/types";
import type { PeriodItem } from "@/modules/expenses/domain/types";

export interface OverdueRepository {
  list(period: string): Promise<OverdueItemList>;
  markDone(id: string): Promise<PeriodItem>;
}
