import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  hasNextMonth,
  hasPreviousMonth,
  monthLabel,
  monthName,
  shiftYearMonth,
  yearOf,
} from "@/modules/periods/domain/year-month";
import { useI18n } from "@/shared/i18n/use-i18n";
import { Button } from "@/shared/ui/button";

interface MonthSwitcherProps {
  period: string;
  onChange: (period: string) => void;
}

export function MonthSwitcher({ period, onChange }: MonthSwitcherProps) {
  const { locale, messages } = useI18n();
  const t = messages.dashboard;
  const previous = shiftYearMonth(period, -1);
  const next = shiftYearMonth(period, 1);

  return (
    <nav aria-label={t.monthNav} className="flex items-center justify-between gap-3">
      <Button
        variant="outline"
        className="px-0"
        disabled={!hasPreviousMonth(period)}
        aria-label={t.previousMonth(monthLabel(previous, locale))}
        onClick={() => onChange(previous)}
      >
        <ChevronLeft aria-hidden="true" className="size-6" />
      </Button>
      <h2
        aria-live="polite"
        className="min-w-0 flex-1 text-center font-heading text-[1.875rem] min-[375px]:text-[clamp(2.5rem,11vw,6rem)] leading-none font-extrabold tracking-tight md:flex-none md:text-left"
      >
        <span className="capitalize">{monthName(period, locale)}</span>{" "}
        <span className="font-mono text-[0.4em] font-normal tracking-normal text-signal">
          {yearOf(period)}
        </span>
      </h2>
      <Button
        variant="outline"
        className="px-0 md:ml-auto"
        disabled={!hasNextMonth(period)}
        aria-label={t.nextMonth(monthLabel(next, locale))}
        onClick={() => onChange(next)}
      >
        <ChevronRight aria-hidden="true" className="size-6" />
      </Button>
    </nav>
  );
}
