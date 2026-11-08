"use client";

import { useDashboard } from "../../application/use-dashboard";
import { httpDashboardRepository } from "../../infrastructure/http-dashboard-repository";
import { ChartPanels } from "../components/chart-panels";
import { DashboardLoadFailed, DashboardLoading, DashboardRefreshFailed } from "../components/dashboard-states";
import { useMessages } from "@/shared/i18n/use-i18n";

interface ChartsContainerProps {
  period: string;
  onSessionEnded: () => void;
}

export function ChartsContainer({ period, onSessionEnded }: ChartsContainerProps) {
  const t = useMessages().dashboard;
  const { dashboard, notOpened, isLoading, loadFailed, refreshFailed, isSettling, reload } = useDashboard(
    httpDashboardRepository,
    period,
    onSessionEnded,
  );

  if (isLoading) {
    return <DashboardLoading className="min-h-268 md:min-h-180 lg:min-h-98" />;
  }
  if (notOpened) {
    return <p className="text-sm text-muted-foreground">{t.chartsNotOpened}</p>;
  }
  if (loadFailed || !dashboard) {
    return <DashboardLoadFailed message={t.chartsLoadFailed} onRetry={reload} />;
  }
  return (
    <>
      {refreshFailed ? <DashboardRefreshFailed /> : null}
      <ChartPanels dashboard={dashboard} isSettling={isSettling} />
    </>
  );
}
