"use client";

import { useDashboard } from "../../application/use-dashboard";
import { useMonthExport } from "../../application/use-month-export";
import { saveFile } from "../../infrastructure/browser-file-saver";
import { httpDashboardRepository } from "../../infrastructure/http-dashboard-repository";
import { ExportAction } from "../components/export-action";
import { monthLabel } from "@/modules/periods/domain/year-month";
import { useI18n } from "@/shared/i18n/use-i18n";

interface ExportContainerProps {
  period: string;
  onSessionEnded: () => void;
}

export function ExportContainer({ period, onSessionEnded }: ExportContainerProps) {
  const { locale } = useI18n();
  const { notOpened } = useDashboard(httpDashboardRepository, period, onSessionEnded);
  const { exportMonth, isExporting, failure } = useMonthExport(
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
      monthLabel={monthLabel(period, locale)}
      isExporting={isExporting}
      failure={failure}
      onExport={exportMonth}
    />
  );
}
