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

import { formatCompactCOP } from "../../domain/chart-format";
import { ChartTooltip } from "./chart-tooltip";

const CHART_HEIGHT = 220;
const BAR_WIDTH = 24;
const AXIS_WIDTH = 64;
const NEGATIVE_LABEL_ROOM = 20;
const AXIS_TEXT = { fill: "var(--muted-foreground)", fontSize: 11 };

export function TotalsBarsChart({ rows }: { rows: { name: string; value: number; fill: string }[] }) {
  return (
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
  );
}
