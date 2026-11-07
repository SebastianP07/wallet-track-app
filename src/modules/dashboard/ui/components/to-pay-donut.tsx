"use client";

import dynamic from "next/dynamic";

import { formatCOP } from "@/modules/accounts/domain/money";
import { formatShare } from "../../domain/chart-format";
import type { ToPayBreakdown } from "../../domain/types";
import { ChartPlaceholder, DeferredChart } from "./deferred-chart";

const ToPayDonutChart = dynamic(() => import("./to-pay-donut-chart").then((module) => module.ToPayDonutChart), {
  ssr: false,
  loading: ChartPlaceholder,
});

const SLICES = [
  { key: "fixed", name: "Fixed", fill: "var(--chart-fixed)" },
  { key: "occasional", name: "Occasional", fill: "var(--chart-occasional)" },
  { key: "overdue", name: "Overdue", fill: "var(--chart-overdue)" },
] as const;

interface ToPayDonutProps {
  breakdown: ToPayBreakdown;
  toPay: number;
}

export function ToPayDonut({ breakdown, toPay }: ToPayDonutProps) {
  const rows = SLICES.map((slice) => ({ ...slice, value: breakdown[slice.key] }));
  return (
    <figure className="flex min-w-0 flex-col gap-3">
      <figcaption className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
        To pay by kind
      </figcaption>
      {toPay === 0 ? (
        <p className="ledger-rows flex h-55 items-center justify-center text-sm text-muted-foreground">
          <span className="bg-background px-2">Nothing left to pay this month.</span>
        </p>
      ) : (
        <DeferredChart className="relative h-55">
          <ToPayDonutChart rows={rows} toPay={toPay} />
        </DeferredChart>
      )}
      <table className="w-full text-sm">
        <caption className="sr-only">To pay by kind: the amounts behind the chart.</caption>
        <thead className="sr-only">
          <tr>
            <th scope="col">Kind</th>
            <th scope="col">Amount</th>
            <th scope="col">Share</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="border-t border-rule">
              <th scope="row" className="py-1.5 text-left font-normal">
                <svg aria-hidden="true" viewBox="0 0 10 10" className="mr-2 inline size-2.5">
                  <rect width="10" height="10" rx="2" fill={row.fill} />
                </svg>
                {row.name}
              </th>
              <td className="py-1.5 text-right font-mono text-xs tabular-nums [overflow-wrap:anywhere]">
                {formatCOP(row.value)}
              </td>
              <td className="w-12 py-1.5 text-right font-mono text-xs tabular-nums text-muted-foreground">
                {formatShare(row.value, toPay)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
