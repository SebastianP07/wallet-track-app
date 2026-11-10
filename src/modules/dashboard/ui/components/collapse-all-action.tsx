"use client";

import { useState } from "react";
import { ChevronsDownUp } from "lucide-react";

import { useMessages } from "@/shared/i18n/use-i18n";
import { Button } from "@/shared/ui/button";

interface CollapseAllActionProps {
  anyOpen: boolean;
  onCollapseAll: () => void;
}

// Stays enabled while every section is already closed, so focus never drops off it; a click then does nothing.
// Offline, the Dashboard's disabled fieldset turns it off with every other control, as the sections show open.
export function CollapseAllAction({ anyOpen, onCollapseAll }: CollapseAllActionProps) {
  const t = useMessages().dashboard.collapseAll;
  const [hasCollapsed, setHasCollapsed] = useState(false);
  // Cleared as soon as a section opens again, so the next collapse is announced anew.
  const announcement = hasCollapsed && !anyOpen ? t.done : "";
  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        variant="outline"
        onClick={() => {
          onCollapseAll();
          setHasCollapsed(true);
        }}
      >
        <ChevronsDownUp aria-hidden="true" className="size-4" />
        {t.action}
      </Button>
      <p role="status" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}
