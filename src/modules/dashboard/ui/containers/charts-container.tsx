"use client";

import { useDashboard } from "../../application/use-dashboard";
import { httpDashboardRepository } from "../../infrastructure/http-dashboard-repository";
import { ChartPanels } from "../components/chart-panels";
import { DashboardLoadFailed, DashboardLoading, DashboardRefreshFailed } from "../components/dashboard-states";

interface ChartsContainerProps {
  period: string;
  onSessionEnded: () => void;
}

export function ChartsContainer({ period, onSessionEnded }: ChartsContainerProps) {
  const { dashboard, notOpened, isLoading, loadFailed, refreshFailed, isSettling, reload } = useDashboard(
    httpDashboardRepository,
    period,
    onSessionEnded,
  );

  if (isLoading) {
    return <DashboardLoading className="min-h-268 md:min-h-180 lg:min-h-98" />;
  }
  if (notOpened) {
    return <p className="text-sm text-muted-foreground">Open this month to see its charts.</p>;
  }
  if (loadFailed || !dashboard) {
    return <DashboardLoadFailed what="The charts" onRetry={reload} />;
  }
  return (
    <>
      {refreshFailed ? <DashboardRefreshFailed /> : null}
      <ChartPanels dashboard={dashboard} isSettling={isSettling} />
    </>
  );
}
