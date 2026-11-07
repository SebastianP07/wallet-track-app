import { useMutation } from "@tanstack/react-query";

import type { DashboardRepository } from "./dashboard-repository";
import { describeExportFailure } from "../domain/export-failure";
import { statusOf } from "@/shared/api/http-client";

export function useMonthExport(
  repository: DashboardRepository,
  period: string,
  saveFile: (blob: Blob, fileName: string) => void,
  onSessionEnded: () => void,
) {
  const { mutate, isPending, error, data } = useMutation({
    // Reading a month moves no KPI.
    meta: { keepsDashboard: true },
    mutationFn: () => repository.exportMonth(period),
    onSuccess: ({ blob, fileName }) => saveFile(blob, fileName),
    onError: (cause) => {
      if (statusOf(cause) === 401) {
        onSessionEnded();
      }
    },
  });

  return {
    exportMonth: () => mutate(),
    isExporting: isPending,
    failure: error && statusOf(error) !== 401 ? describeExportFailure(statusOf(error)) : null,
    savedFileName: isPending ? null : (data?.fileName ?? null),
  };
}
