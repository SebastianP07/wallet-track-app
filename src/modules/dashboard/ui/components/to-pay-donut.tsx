"use client";

import { Pie, PieChart, ResponsiveContainer, Tooltip, type PieLabelRenderProps } from "recharts";

import { formatCOP } from "@/modules/accounts/domain/money";
import { formatCompactCOP, formatShare } from "../../domain/chart-format";
import type { ToPayBreakdown } from "../../domain/types";
import { ChartTooltip } from "./chart-tooltip";

const CHART_HEIGHT = 220;
const LABEL_GAP = 12;
const RADIANS_PER_DEGREE = Math.PI / 180;

const SLICES = [
  { key: "fixed", name: "Fixed", fill: "var(--chart-fixed)" },
  { key: "occasional", name: "Occasional", fill: "var(--chart-occasional)" },
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
        <div aria-hidden="true" className="relative h-55">
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <PieChart accessibilityLayer={false}>
              <Pie
                // A slice of nothing draws nothing, and has no label to collide with its neighbour.
                data={rows.filter((row) => row.value > 0)}
                dataKey="value"
                nameKey="name"
                innerRadius={54}
                outerRadius={74}
                startAngle={90}
                endAngle={-270}
                stroke="var(--background)"
                strokeWidth={2}
                isAnimationActive={false}
                labelLine={false}
                label={(props) => <SliceLabel {...props} whole={toPay} />}
              />
              <Tooltip
                content={<ChartTooltip />}
                wrapperClassName="z-10"
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-sans text-base font-semibold">{formatCompactCOP(toPay)}</span>
            <span className="text-xs text-muted-foreground">to pay</span>
          </div>
        </div>
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

// The slice's name beside it, so that telling them apart never rests on color.
function SliceLabel({
  cx,
  cy,
  midAngle,
  outerRadius,
  name,
  value,
  whole,
}: PieLabelRenderProps & { whole: number }) {
  const angle = -(midAngle ?? 0) * RADIANS_PER_DEGREE;
  const radius = Number(outerRadius) + LABEL_GAP;
  const x = Number(cx) + radius * Math.cos(angle);
  const y = Number(cy) + radius * Math.sin(angle);
  return (
    <text
      x={x}
      y={y}
      fill="var(--foreground)"
      fontSize={12}
      textAnchor={x >= Number(cx) ? "start" : "end"}
      dominantBaseline="central"
    >
      {name} {formatShare(Number(value), whole)}
    </text>
  );
}
