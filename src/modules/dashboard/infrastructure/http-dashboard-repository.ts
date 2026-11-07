import type { DashboardRepository } from "../application/dashboard-repository";
import type { Dashboard } from "../domain/types";
import { apiGet, apiGetFile } from "@/shared/api/http-client";

export const httpDashboardRepository: DashboardRepository = {
  get(period) {
    return apiGet<Dashboard>(`/dashboard?period=${encodeURIComponent(period)}`);
  },
  async exportMonth(period) {
    const { blob, fileName } = await apiGetFile(
      `/dashboard/export?period=${encodeURIComponent(period)}`,
      "text/csv",
    );
    return { blob, fileName: fileName ?? `wallet-track-${period}.csv` };
  },
};
