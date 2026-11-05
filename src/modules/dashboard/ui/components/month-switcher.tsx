import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  hasNextMonth,
  hasPreviousMonth,
  monthName,
  shiftYearMonth,
  yearOf,
} from "@/modules/periods/domain/year-month";
import { Button } from "@/shared/ui/button";

interface MonthSwitcherProps {
  period: string;
  onChange: (period: string) => void;
}

export function MonthSwitcher({ period, onChange }: MonthSwitcherProps) {
  const previous = shiftYearMonth(period, -1);
  const next = shiftYearMonth(period, 1);

  return (
    <nav aria-label="Month" className="flex items-center justify-between gap-3">
      <Button
        variant="outline"
        className="px-0"
        disabled={!hasPreviousMonth(period)}
        aria-label={`Previous month, ${monthName(previous)} ${yearOf(previous)}`}
        onClick={() => onChange(previous)}
      >
        <ChevronLeft aria-hidden="true" className="size-6" />
      </Button>
      <h2
        aria-live="polite"
        className="min-w-0 flex-1 text-center font-heading text-[clamp(2.5rem,11vw,6rem)] leading-none font-extrabold tracking-tight md:flex-none md:text-left"
      >
        {monthName(period)}{" "}
        <span className="font-mono text-[0.4em] font-normal tracking-normal text-signal">
          {yearOf(period)}
        </span>
      </h2>
      <Button
        variant="outline"
        className="px-0 md:ml-auto"
        disabled={!hasNextMonth(period)}
        aria-label={`Next month, ${monthName(next)} ${yearOf(next)}`}
        onClick={() => onChange(next)}
      >
        <ChevronRight aria-hidden="true" className="size-6" />
      </Button>
    </nav>
  );
}
