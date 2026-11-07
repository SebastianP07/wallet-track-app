"use client";

import { Pie, PieChart, ResponsiveContainer, Tooltip, type PieLabelRenderProps } from "recharts";

import { formatCompactCOP, formatShare } from "../../domain/chart-format";
import { ChartTooltip } from "./chart-tooltip";

const CHART_HEIGHT = 220;
const LABEL_GAP = 12;
const RADIANS_PER_DEGREE = Math.PI / 180;

interface ToPayDonutChartProps {
  rows: { name: string; fill: string; value: number }[];
  toPay: number;
}

export function ToPayDonutChart({ rows, toPay }: ToPayDonutChartProps) {
  return (
    <>
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
            // The chart is hidden from assistive technology; its table says everything it says.
            rootTabIndex={-1}
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
    </>
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
