import type { Dashboard } from "../domain/types";

export interface DashboardRepository {
  get(period: string): Promise<Dashboard>;
}
