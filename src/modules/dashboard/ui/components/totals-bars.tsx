"use client";

import dynamic from "next/dynamic";
import { cn } from "cn";

import { formatCOP } from "@/modules/accounts/domain/money";
import type { DashboardKpis } from "../../domain/types";
import { ChartPlaceholder, DeferredChart } from "./deferred-chart";
import type { Messages } from "@/shared/i18n/messages";
import { useMessages } from "@/shared/i18n/use-i18n";

const TotalsBarsChart = dynamic(() => import("./totals-bars-chart").then((module) => module.TotalsBarsChart), {
  ssr: false,
  loading: ChartPlaceholder,
});

const NEUTRAL = "var(--chart-2)";

interface TotalsBarsProps {
  kpis: DashboardKpis;
}

function rowsOf(kpis: DashboardKpis, t: Messages["dashboard"]["kpis"]) {
  return [
    { name: t.currentTotal, value: kpis.currentTotal, fill: NEUTRAL },
    { name: t.toPay, value: kpis.toPay, fill: NEUTRAL },
    // The one bar the chart is about, and red when it is under water, its sign printed beside it too.
    { name: t.surplus, value: kpis.surplus, fill: kpis.surplus < 0 ? "var(--destructive)" : "var(--signal)" },
  ];
}

export function TotalsBars({ kpis }: TotalsBarsProps) {
  const { kpis: kpiLabels, charts: t } = useMessages().dashboard;
  const rows = rowsOf(kpis, kpiLabels);
  const isAllZero = rows.every((row) => row.value === 0);
  return (
    <figure className="flex min-w-0 flex-col gap-3">
      <figcaption className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
        {t.totalsCompare}
      </figcaption>
      {isAllZero ? (
        <p className="ledger-rows flex h-55 items-center justify-center text-sm text-muted-foreground">
          <span className="bg-background px-2">{t.allZero}</span>
        </p>
      ) : (
        <DeferredChart className="h-55">
          <TotalsBarsChart rows={rows} />
        </DeferredChart>
      )}
      <table className="w-full text-sm">
        <caption className="sr-only">{t.totalsCaption}</caption>
        <thead className="sr-only">
          <tr>
            <th scope="col">{t.total}</th>
            <th scope="col">{t.amount}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-t border-rule">
              <th scope="row" className="py-1.5 text-left font-normal">
                {row.name}
              </th>
              <td
                className={cn(
                  "py-1.5 text-right font-mono text-xs tabular-nums [overflow-wrap:anywhere]",
                  row.value < 0 && "text-destructive",
                )}
              >
                {formatCOP(row.value)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
