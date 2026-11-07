"use client";

import dynamic from "next/dynamic";
import { cn } from "cn";

import { formatCOP } from "@/modules/accounts/domain/money";
import type { DashboardKpis } from "../../domain/types";
import { ChartPlaceholder, DeferredChart } from "./deferred-chart";

const TotalsBarsChart = dynamic(() => import("./totals-bars-chart").then((module) => module.TotalsBarsChart), {
  ssr: false,
  loading: ChartPlaceholder,
});

const NEUTRAL = "var(--chart-2)";

interface TotalsBarsProps {
  kpis: DashboardKpis;
}

function rowsOf(kpis: DashboardKpis) {
  return [
    { name: "Total actual", value: kpis.currentTotal, fill: NEUTRAL },
    { name: "To pay", value: kpis.toPay, fill: NEUTRAL },
    // The one bar the chart is about, and red when it is under water, its sign printed beside it too.
    { name: "Left over", value: kpis.surplus, fill: kpis.surplus < 0 ? "var(--destructive)" : "var(--signal)" },
  ];
}

export function TotalsBars({ kpis }: TotalsBarsProps) {
  const rows = rowsOf(kpis);
  const isAllZero = rows.every((row) => row.value === 0);
  return (
    <figure className="flex min-w-0 flex-col gap-3">
      <figcaption className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
        How the totals compare
      </figcaption>
      {isAllZero ? (
        <p className="ledger-rows flex h-55 items-center justify-center text-sm text-muted-foreground">
          <span className="bg-background px-2">All of these are zero this month.</span>
        </p>
      ) : (
        <DeferredChart className="h-55">
          <TotalsBarsChart rows={rows} />
        </DeferredChart>
      )}
      <table className="w-full text-sm">
        <caption className="sr-only">The month&apos;s totals: the amounts behind the chart.</caption>
        <thead className="sr-only">
          <tr>
            <th scope="col">Total</th>
            <th scope="col">Amount</th>
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
