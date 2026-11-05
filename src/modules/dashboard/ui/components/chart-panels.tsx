"use client";

import dynamic from "next/dynamic";
import { cn } from "cn";

import type { Dashboard } from "../../domain/types";
import { UpcomingDueList } from "./upcoming-due-list";

function ChartPlaceholder() {
  return <div className="ledger-rows h-80" />;
}

// Recharts writes style attributes. Rendered on the server they would reach the browser as HTML, which the
// CSP refuses; created by React in the browser they are set through the DOM, which it allows.
const ToPayDonut = dynamic(() => import("./to-pay-donut").then((module) => module.ToPayDonut), {
  ssr: false,
  loading: ChartPlaceholder,
});
const TotalsBars = dynamic(() => import("./totals-bars").then((module) => module.TotalsBars), {
  ssr: false,
  loading: ChartPlaceholder,
});

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
        <UpcomingDueList items={dashboard.upcomingDue} period={dashboard.period.period} />
      </div>
    </div>
  );
}
