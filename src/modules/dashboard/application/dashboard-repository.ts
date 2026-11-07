import type { Dashboard, MonthExport } from "../domain/types";

export interface DashboardRepository {
  get(period: string): Promise<Dashboard>;
  exportMonth(period: string): Promise<MonthExport>;
}
