import { Download } from "lucide-react";

import { useMessages } from "@/shared/i18n/use-i18n";
import { Button } from "@/shared/ui/button";
import { FormAlert } from "@/shared/ui/form-alert";

interface ExportActionProps {
  monthLabel: string;
  isExporting: boolean;
  failure: string | null;
  savedFileName: string | null;
  onExport: () => void;
}

export function ExportAction({ monthLabel, isExporting, failure, savedFileName, onExport }: ExportActionProps) {
  const t = useMessages().dashboard.export;
  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        variant="outline"
        disabled={isExporting}
        aria-label={isExporting ? t.exportingFor(monthLabel) : t.actionFor(monthLabel)}
        onClick={onExport}
      >
        <Download aria-hidden="true" className="size-4" />
        {isExporting ? t.exporting : t.action}
      </Button>
      <FormAlert message={failure} />
      <p role="status" className="sr-only">
        {savedFileName ? t.downloaded(savedFileName) : ""}
      </p>
    </div>
  );
}
