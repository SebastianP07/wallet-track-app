"use client";

import { useState } from "react";

import { describeDevice } from "../../domain/security-display";
import type { ActiveSession } from "../../domain/types";
import { formatDateTime } from "@/shared/format/date";
import { useI18n } from "@/shared/i18n/use-i18n";
import { Button } from "@/shared/ui/button";
import { ConfirmPanel } from "@/shared/ui/confirm-panel";

interface SessionRowProps {
  session: ActiveSession;
  isRevoking: boolean;
  onRevoke: () => void;
}

export function SessionRow({ session, isRevoking, onRevoke }: SessionRowProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const { messages } = useI18n();
  const t = messages.security;
  const device = describeDevice(session.userAgent, messages);

  return (
    <li className="flex flex-col gap-1 border-t border-rule py-2">
      <p className="flex flex-wrap items-baseline gap-x-2">
        <span className="font-medium" title={session.userAgent ?? undefined}>
          {device}
        </span>
        {session.current ? <span className="font-mono text-xs text-signal">{t.thisDevice}</span> : null}
        {session.mfaPending ? (
          <span className="font-mono text-xs text-destructive">{t.mfaPending}</span>
        ) : null}
      </p>
      <p className="font-mono text-xs break-words text-muted-foreground">
        {t.sessionTimes(
          session.ip ?? t.unknownAddress,
          formatDateTime(session.lastSeenAt),
          formatDateTime(session.createdAt),
        )}
      </p>
      {session.mfaPending ? (
        <p className="text-sm text-muted-foreground">
          {t.mfaPendingWarning}
        </p>
      ) : null}

      {isConfirming ? (
        <ConfirmPanel
          confirmLabel={t.endSession}
          confirmDisabled={isRevoking}
          className="md:max-w-md"
          onConfirm={() => {
            onRevoke();
            setIsConfirming(false);
          }}
          onKeep={() => setIsConfirming(false)}
        >
          {session.current ? t.endThisSession : t.endOtherSession(device)}
        </ConfirmPanel>
      ) : (
        <div className="flex flex-wrap items-center">
          <Button
            variant="link"
            className="min-h-11 px-2 text-sm first:-ml-2"
            aria-label={t.endSessionOn(device, session.current)}
            onClick={() => setIsConfirming(true)}
          >
            {t.endSession}
          </Button>
        </div>
      )}
    </li>
  );
}
