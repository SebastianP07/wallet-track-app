import { useId, type ReactNode } from "react";
import { cn } from "cn";

import { Button } from "./button";
import { useMessages } from "@/shared/i18n/use-i18n";

interface ConfirmPanelProps {
  children: ReactNode;
  confirmLabel: string;
  confirmAriaLabel?: string;
  keepLabel?: string;
  confirmDisabled?: boolean;
  className?: string;
  actionsClassName?: string;
  // A second way to go ahead, for a choice between two outcomes; the three buttons then stack.
  alternative?: { label: string; ariaLabel?: string; onSelect: () => void };
  onConfirm: () => void;
  onKeep: () => void;
}

// Focus lands on the way out, not on the destructive button: a second press of Enter must not delete anything.
export function ConfirmPanel({
  children,
  confirmLabel,
  confirmAriaLabel,
  keepLabel,
  confirmDisabled = false,
  className,
  actionsClassName,
  alternative,
  onConfirm,
  onKeep,
}: ConfirmPanelProps) {
  const messageId = useId();
  const t = useMessages().common;
  return (
    <div role="group" aria-labelledby={messageId} className={cn("flex flex-col gap-2 pt-1", className)}>
      <p id={messageId} className="text-sm">
        {children}
      </p>
      <div className={cn("flex gap-2", alternative && "flex-col", actionsClassName)}>
        <Button
          variant="destructive"
          className="flex-1"
          disabled={confirmDisabled}
          aria-label={confirmAriaLabel}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
        {alternative ? (
          <Button
            variant="destructive"
            className="flex-1"
            disabled={confirmDisabled}
            aria-label={alternative.ariaLabel}
            onClick={alternative.onSelect}
          >
            {alternative.label}
          </Button>
        ) : null}
        <Button autoFocus variant="outline" className="flex-1" onClick={onKeep}>
          {keepLabel ?? t.keepIt}
        </Button>
      </div>
    </div>
  );
}
