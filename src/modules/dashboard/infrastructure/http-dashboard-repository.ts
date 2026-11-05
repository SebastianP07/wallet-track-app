import type { DashboardRepository } from "../application/dashboard-repository";
import type { Dashboard } from "../domain/types";
import { apiGet } from "@/shared/api/http-client";

export const httpDashboardRepository: DashboardRepository = {
  get(period) {
    return apiGet<Dashboard>(`/dashboard?period=${encodeURIComponent(period)}`);
  },
};
