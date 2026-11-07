import { Download } from "lucide-react";

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
  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        variant="outline"
        disabled={isExporting}
        aria-label={`${isExporting ? "Exporting" : "Export CSV"} for ${monthLabel}`}
        onClick={onExport}
      >
        <Download aria-hidden="true" className="size-4" />
        {isExporting ? "Exporting…" : "Export CSV"}
      </Button>
      <FormAlert message={failure} />
      <p role="status" className="sr-only">
        {savedFileName ? `Downloaded ${savedFileName}.` : ""}
      </p>
    </div>
  );
}
