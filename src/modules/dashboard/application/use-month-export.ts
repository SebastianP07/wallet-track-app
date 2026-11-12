import { useMutation } from "@tanstack/react-query";

import type { DashboardRepository } from "./dashboard-repository";
import { describeExportFailure } from "../domain/export-failure";
import { statusOf } from "@/shared/api/http-client";
import { notify } from "@/shared/feedback/toast-store";
import { useMessages } from "@/shared/i18n/use-i18n";

export function useMonthExport(
  repository: DashboardRepository,
  period: string,
  saveFile: (blob: Blob, fileName: string) => void,
  onSessionEnded: () => void,
) {
  const messages = useMessages();
  const { mutate, isPending, error } = useMutation({
    // Reading a month moves no KPI.
    meta: { keepsDashboard: true },
    mutationFn: () => repository.exportMonth(period),
    onSuccess: ({ blob, fileName }) => {
      saveFile(blob, fileName);
      notify.success(messages.dashboard.export.downloaded(fileName));
    },
    onError: (cause) => {
      if (statusOf(cause) === 401) {
        onSessionEnded();
        return;
      }
      notify.error(describeExportFailure(statusOf(cause), messages));
    },
  });

  return {
    exportMonth: () => mutate(),
    isExporting: isPending,
    failure: error && statusOf(error) !== 401 ? describeExportFailure(statusOf(error), messages) : null,
  };
}
