"use client";

import { useState } from "react";
import { cn } from "cn";

import type { Period } from "../../domain/types";
import { monthName, yearOf } from "../../domain/year-month";
import { Button } from "@/shared/ui/button";
import { ConfirmPanel } from "@/shared/ui/confirm-panel";
import { FormAlert } from "@/shared/ui/form-alert";

function StatusLabel({ children, active = false }: { children: string; active?: boolean }) {
  return (
    <span
      className={cn(
        "w-fit border px-2 py-1 font-mono text-xs tracking-wide uppercase",
        active ? "border-signal text-signal" : "border-rule text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}

interface PeriodStatusBarProps {
  period: string;
  selected: Period | null;
  isLoading: boolean;
  loadFailed: boolean;
  failure: string | null;
  isOpening: boolean;
  isClosing: boolean;
  reload: () => void;
  openMonth: () => void;
  closeMonth: () => void;
}

export function PeriodStatusBar({
  period,
  selected,
  isLoading,
  loadFailed,
  failure,
  isOpening,
  isClosing,
  reload,
  openMonth,
  closeMonth,
}: PeriodStatusBarProps) {
  const [isConfirmingClose, setIsConfirmingClose] = useState(false);
  const month = `${monthName(period)} ${yearOf(period)}`;

  if (isLoading) {
    return (
      // As tall as the bar it turns into, so the page below does not jump when it answers.
      <p role="status" className="min-h-35 font-mono text-xs text-muted-foreground md:min-h-20">
        Checking this month…
      </p>
    );
  }

  if (loadFailed) {
    return (
      <div className="flex flex-col items-start gap-3">
        <FormAlert message="The status of this month could not be loaded." />
        <Button variant="outline" onClick={reload}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 border-y border-rule py-3">
      <FormAlert message={failure} />

      {selected === null ? (
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2">
            <StatusLabel>Not opened</StatusLabel>
            <p className="text-sm text-muted-foreground">
              {month} has no period yet. Opening it copies your active recurring templates into it.
            </p>
          </div>
          <Button className="shrink-0" disabled={isOpening} onClick={openMonth}>
            {isOpening ? "Opening…" : "Open month"}
          </Button>
        </div>
      ) : null}

      {selected?.status === "closed" ? (
        <div className="flex flex-col gap-2">
          <StatusLabel>Closed</StatusLabel>
          <p className="text-sm text-muted-foreground">
            {month} is closed. Its unpaid expenses moved to the Overdue section of the next month that is
            not closed; income still to receive stays here as overdue.
          </p>
        </div>
      ) : null}

      {selected?.status === "open" && !isConfirmingClose ? (
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2">
            <StatusLabel active>Open</StatusLabel>
            <p className="text-sm text-muted-foreground">{month} is open.</p>
          </div>
          <Button
            variant="outline"
            className="shrink-0"
            disabled={isClosing}
            onClick={() => setIsConfirmingClose(true)}
          >
            {isClosing ? "Closing…" : "Close month"}
          </Button>
        </div>
      ) : null}

      {selected?.status === "open" && isConfirmingClose ? (
        <div className="flex flex-col gap-3">
          <StatusLabel active>Open</StatusLabel>
          <ConfirmPanel
            confirmLabel="Close month"
            keepLabel="Keep it open"
            actionsClassName="md:max-w-md"
            onConfirm={() => {
              closeMonth();
              setIsConfirmingClose(false);
            }}
            onKeep={() => setIsConfirmingClose(false)}
          >
            Close {month}? Every unpaid fixed and occasional item, and everything still in its Overdue
            section, moves to the Overdue section of the next month that is not closed, where it counts
            toward to pay. Pending income becomes overdue and stays in {monthName(period)}. Card charges
            stay as they are. A closed month can&apos;t be reopened.
          </ConfirmPanel>
        </div>
      ) : null}
    </div>
  );
}
