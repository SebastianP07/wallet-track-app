"use client";

import { useState } from "react";
import { cn } from "cn";

import type { Period } from "../../domain/types";
import { monthLabel, monthName } from "../../domain/year-month";
import { useI18n } from "@/shared/i18n/use-i18n";
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
  const { locale, messages } = useI18n();
  const t = messages.periods;
  const month = monthLabel(period, locale);

  if (isLoading) {
    return (
      // As tall as the bar it turns into, so the page below does not jump when it answers.
      <p role="status" className="min-h-35 font-mono text-xs text-muted-foreground md:min-h-20">
        {t.checking}
      </p>
    );
  }

  if (loadFailed) {
    return (
      <div className="flex flex-col items-start gap-3">
        <FormAlert message={t.statusLoadFailed} />
        <Button variant="outline" onClick={reload}>
          {messages.common.tryAgain}
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
            <StatusLabel>{t.notOpened}</StatusLabel>
            <p className="text-sm text-muted-foreground">
              {t.notOpenedText(month)}
            </p>
          </div>
          <Button className="shrink-0" disabled={isOpening} onClick={openMonth}>
            {isOpening ? t.opening : t.openMonth}
          </Button>
        </div>
      ) : null}

      {selected?.status === "closed" ? (
        <div className="flex flex-col gap-2">
          <StatusLabel>{t.closed}</StatusLabel>
          <p className="text-sm text-muted-foreground">
            {t.closedText(month)}
          </p>
        </div>
      ) : null}

      {selected?.status === "open" && !isConfirmingClose ? (
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2">
            <StatusLabel active>{t.open}</StatusLabel>
            <p className="text-sm text-muted-foreground">{t.openText(month)}</p>
          </div>
          <Button
            variant="outline"
            className="shrink-0"
            disabled={isClosing}
            onClick={() => setIsConfirmingClose(true)}
          >
            {isClosing ? t.closing : t.closeMonth}
          </Button>
        </div>
      ) : null}

      {selected?.status === "open" && isConfirmingClose ? (
        <div className="flex flex-col gap-3">
          <StatusLabel active>{t.open}</StatusLabel>
          <ConfirmPanel
            confirmLabel={t.closeMonth}
            keepLabel={t.keepOpen}
            actionsClassName="md:max-w-md"
            onConfirm={() => {
              closeMonth();
              setIsConfirmingClose(false);
            }}
            onKeep={() => setIsConfirmingClose(false)}
          >
            {t.closeConfirm(month, monthName(period, locale))}
          </ConfirmPanel>
        </div>
      ) : null}
    </div>
  );
}
