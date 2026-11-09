"use client";

import { cn } from "cn";

import type { Dashboard } from "../../domain/types";
import { ToPayDonut } from "./to-pay-donut";
import { TotalsBars } from "./totals-bars";
import { UpcomingDueList } from "./upcoming-due-list";

interface ChartPanelsProps {
  dashboard: Dashboard;
  isSettling: boolean;
}

export function ChartPanels({ dashboard, isSettling }: ChartPanelsProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 transition-opacity md:grid-cols-2 lg:grid-cols-3",
        isSettling && "opacity-60",
      )}
    >
      <ToPayDonut breakdown={dashboard.toPayBreakdown} toPay={dashboard.kpis.toPay} />
      <TotalsBars kpis={dashboard.kpis} />
      <div className="md:col-span-2 lg:col-span-1">
        <UpcomingDueList items={dashboard.upcomingDue} />
      </div>
    </div>
  );
}
