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

const NOT_OPENED_NOTE = "Open this month to see the rest. Its balances are the same as in any month.";
const CLOSED_NOTE =
  "This month is closed, so what was pending is overdue: it stays in Coming in and Going out, and is out of To pay and To arrive. Left over is therefore today's Total actual.";

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

  if (isLoading) {
    return <DashboardLoading />;
  }
  if (notOpened) {
    return <KpiOverview kpis={balances ?? {}} note={NOT_OPENED_NOTE} isSettling={false} />;
  }
  if (loadFailed || !dashboard) {
    return <DashboardLoadFailed what="The overview" onRetry={reload} />;
  }
  return (
    <>
      {refreshFailed ? <DashboardRefreshFailed /> : null}
      <KpiOverview
        kpis={dashboard.kpis}
        note={dashboard.period.status === "closed" ? CLOSED_NOTE : null}
        isSettling={isSettling}
      />
    </>
  );
}
