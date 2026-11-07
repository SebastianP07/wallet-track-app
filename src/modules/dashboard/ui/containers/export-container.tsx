"use client";

import { useDashboard } from "../../application/use-dashboard";
import { useMonthExport } from "../../application/use-month-export";
import { saveFile } from "../../infrastructure/browser-file-saver";
import { httpDashboardRepository } from "../../infrastructure/http-dashboard-repository";
import { ExportAction } from "../components/export-action";
import { monthName, yearOf } from "@/modules/periods/domain/year-month";

interface ExportContainerProps {
  period: string;
  onSessionEnded: () => void;
}

export function ExportContainer({ period, onSessionEnded }: ExportContainerProps) {
  const { notOpened } = useDashboard(httpDashboardRepository, period, onSessionEnded);
  const { exportMonth, isExporting, failure, savedFileName } = useMonthExport(
    httpDashboardRepository,
    period,
    saveFile,
    onSessionEnded,
  );
  // A month not opened has nothing to export, and the status bar above already says so.
  if (notOpened) {
    return null;
  }
  return (
    <ExportAction
      monthLabel={`${monthName(period)} ${yearOf(period)}`}
      isExporting={isExporting}
      failure={failure}
      savedFileName={savedFileName}
      onExport={exportMonth}
    />
  );
}
