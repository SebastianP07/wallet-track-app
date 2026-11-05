"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "cn";

import { formatCOP } from "@/modules/accounts/domain/money";
import { formatCompactCOP } from "../../domain/chart-format";
import type { DashboardKpis } from "../../domain/types";
import { ChartTooltip } from "./chart-tooltip";

const CHART_HEIGHT = 220;
const BAR_WIDTH = 24;
const AXIS_WIDTH = 64;
const NEGATIVE_LABEL_ROOM = 20;
const AXIS_TEXT = { fill: "var(--muted-foreground)", fontSize: 11 };
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
    { name: "Savings", value: kpis.savings, fill: NEUTRAL },
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
        <div aria-hidden="true" className="h-55">
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <BarChart data={rows} margin={{ top: 20, right: 4, bottom: 16, left: 0 }} accessibilityLayer={false}>
              <CartesianGrid vertical={false} stroke="var(--rule)" />
              <XAxis
                dataKey="name"
                interval={0}
                axisLine={false}
                tickLine={false}
                tick={AXIS_TEXT}
                tickMargin={6}
              />
              <YAxis
                width={AXIS_WIDTH}
                axisLine={false}
                tickLine={false}
                tick={AXIS_TEXT}
                tickFormatter={formatCompactCOP}
                // Room for the label under a negative bar, clear of the names along the bottom.
                padding={{ bottom: rows.some((row) => row.value < 0) ? NEGATIVE_LABEL_ROOM : 0 }}
              />
              <ReferenceLine y={0} stroke="var(--muted-foreground)" />
              <Tooltip cursor={{ fill: "var(--rule)" }} content={<ChartTooltip />} wrapperClassName="z-10" />
              <Bar
                dataKey="value"
                maxBarSize={BAR_WIDTH}
                radius={[4, 4, 0, 0]}
                isAnimationActive={false}
              >
                <LabelList
                  dataKey="value"
                  position="top"
                  fill="var(--foreground)"
                  fontSize={11}
                  formatter={(value) => formatCompactCOP(Number(value))}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
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
