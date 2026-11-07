"use client";

import { useState } from "react";

import { describeDevice, formatDateTime } from "../../domain/security-display";
import type { ActiveSession } from "../../domain/types";
import { Button } from "@/shared/ui/button";
import { ConfirmPanel } from "@/shared/ui/confirm-panel";

interface SessionRowProps {
  session: ActiveSession;
  isRevoking: boolean;
  onRevoke: () => void;
}

export function SessionRow({ session, isRevoking, onRevoke }: SessionRowProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const device = describeDevice(session.userAgent);

  return (
    <li className="flex flex-col gap-1 border-t border-rule py-2">
      <p className="flex flex-wrap items-baseline gap-x-2">
        <span className="font-medium" title={session.userAgent ?? undefined}>
          {device}
        </span>
        {session.current ? <span className="font-mono text-xs text-signal">This device</span> : null}
        {session.mfaPending ? (
          <span className="font-mono text-xs text-destructive">Second factor pending</span>
        ) : null}
      </p>
      <p className="font-mono text-xs break-words text-muted-foreground">
        {session.ip ?? "Unknown address"} · Seen {formatDateTime(session.lastSeenAt)} · Started{" "}
        {formatDateTime(session.createdAt)}
      </p>
      {session.mfaPending ? (
        <p className="text-sm text-muted-foreground">
          Someone passed the password step here. If it wasn&apos;t you, end this and change your password.
        </p>
      ) : null}

      {isConfirming ? (
        <ConfirmPanel
          confirmLabel="End session"
          confirmDisabled={isRevoking}
          className="md:max-w-md"
          onConfirm={() => {
            onRevoke();
            setIsConfirming(false);
          }}
          onKeep={() => setIsConfirming(false)}
        >
          {session.current
            ? "End the session on this device? You'll be signed out."
            : `End the session on ${device}? It stops working at once.`}
        </ConfirmPanel>
      ) : (
        <div className="flex flex-wrap items-center">
          <Button
            variant="link"
            className="min-h-11 px-2 text-sm first:-ml-2"
            aria-label={`End session on ${device}${session.current ? ", this device" : ""}`}
            onClick={() => setIsConfirming(true)}
          >
            End session
          </Button>
        </div>
      )}
    </li>
  );
}
