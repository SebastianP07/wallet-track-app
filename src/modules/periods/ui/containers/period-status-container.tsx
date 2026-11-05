"use client";

import { usePeriodStatus } from "../../application/use-period-status";
import { httpPeriodsRepository } from "../../infrastructure/http-periods-repository";
import { PeriodStatusBar } from "../components/period-status-bar";

interface PeriodStatusContainerProps {
  period: string;
  onSessionEnded: () => void;
}

export function PeriodStatusContainer({ period, onSessionEnded }: PeriodStatusContainerProps) {
  const status = usePeriodStatus(httpPeriodsRepository, period, onSessionEnded);
  return <PeriodStatusBar period={period} {...status} />;
}
