"use client";

import { useAccountTotals } from "@/modules/accounts/application/use-account-totals";
import { httpAccountsRepository } from "@/modules/accounts/infrastructure/http-accounts-repository";
import { useDashboard } from "../../application/use-dashboard";
import { httpDashboardRepository } from "../../infrastructure/http-dashboard-repository";
import {
  DashboardLoadFailed,
  DashboardLoading,
  DashboardRefreshFailed,
} from "../components/dashboard-states";
import { KpiOverview } from "../components/kpi-overview";
import { useMessages } from "@/shared/i18n/use-i18n";

interface OverviewContainerProps {
  period: string;
  onSessionEnded: () => void;
}

export function OverviewContainer({ period, onSessionEnded }: OverviewContainerProps) {
  const { dashboard, notOpened, isLoading, loadFailed, refreshFailed, isSettling, reload } = useDashboard(
    httpDashboardRepository,
    period,
    onSessionEnded,
  );
  const balances = useAccountTotals(httpAccountsRepository, notOpened);
  const t = useMessages().dashboard;

  if (isLoading) {
    return <DashboardLoading className="min-h-142 md:min-h-85 lg:min-h-64" />;
  }
  if (notOpened) {
    return <KpiOverview kpis={balances ?? {}} note={t.kpis.notOpenedNote} isSettling={false} />;
  }
  if (loadFailed || !dashboard) {
    return <DashboardLoadFailed message={t.overviewLoadFailed} onRetry={reload} />;
  }
  return (
    <>
      {refreshFailed ? <DashboardRefreshFailed /> : null}
      <KpiOverview
        kpis={dashboard.kpis}
        note={dashboard.period.status === "closed" ? t.kpis.closedNote : null}
        isSettling={isSettling}
      />
    </>
  );
}
