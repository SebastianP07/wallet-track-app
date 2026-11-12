"use client";

import { useEffect, useId, useRef, useState, type MouseEvent, type ReactNode, type SyntheticEvent } from "react";
import { createPortal } from "react-dom";

import { Button } from "./button";
import { FormAlert } from "./form-alert";
import { ActionError } from "@/shared/feedback/action-error";
import { useMessages } from "@/shared/i18n/use-i18n";
import { useOnlineStatus } from "@/shared/pwa/use-online-status";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  // Waited on: the dialog shows it pending, closes once it resolves and stays open with the reason if it fails.
  onConfirm: () => Promise<unknown> | void;
  onClose: () => void;
}

export function ConfirmDialog(props: ConfirmDialogProps) {
  // Mounted only while open, so every opening starts without an earlier attempt's error.
  return props.open ? <OpenConfirmDialog {...props} /> : null;
}

function OpenConfirmDialog({
  title,
  description,
  confirmLabel,
  cancelLabel,
  destructive = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isOnline = useOnlineStatus();
  const { common, feedback: t } = useMessages();
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const region = opener?.closest<HTMLElement>("section, main") ?? null;
    dialog.showModal();
    // Focus starts on the way out, so a second press of Enter confirms nothing. Set here, after showModal, which
    // would otherwise focus the first button.
    cancelRef.current?.focus();
    return () => {
      dialog.close();
      if (opener?.isConnected) {
        opener.focus();
        return;
      }
      // The change took away what opened it: back to the heading of its section, or to the page's main part.
      const fallback = region?.matches("section") ? region.querySelector<HTMLElement>("h3") : region;
      if (fallback?.isConnected) {
        if (!fallback.hasAttribute("tabindex")) {
          fallback.setAttribute("tabindex", "-1");
        }
        fallback.focus({ preventScroll: true });
      }
    };
  }, []);

  const cancel = () => {
    if (!isPending) {
      onClose();
    }
  };

  const confirm = async () => {
    if (isPending) {
      return;
    }
    setError(null);
    setIsPending(true);
    try {
      await onConfirm();
      onClose();
    } catch (cause) {
      setError(cause instanceof ActionError ? cause.message : t.actionFailed);
      setIsPending(false);
    }
  };

  // Escape closes a modal dialog on its own; this one closes through its owner, and not while the answer is awaited.
  const onCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    cancel();
  };

  const onBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) {
      cancel();
    }
  };

  // In the page's body, outside the offline fieldset, so going offline never disables the way out.
  return createPortal(
    <dialog
      ref={dialogRef}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      aria-busy={isPending}
      onCancel={onCancel}
      onClick={onBackdropClick}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-lg border border-border bg-card p-0 text-card-foreground shadow-[0_16px_48px_rgb(0_0_0/0.6)] backdrop:bg-black/70"
    >
      <div className="flex flex-col gap-4 p-5">
        <h2 id={titleId} className="font-heading text-lg leading-snug font-bold wrap-anywhere">
          {title}
        </h2>
        {description ? (
          <div id={descriptionId} className="text-sm text-muted-foreground">
            {description}
          </div>
        ) : null}
        <FormAlert message={error} />
        {isOnline ? null : <p className="text-sm text-muted-foreground">{t.offline}</p>}
        {/* Stacked on a phone, with the way out last, nearest the thumb. */}
        <div className="flex flex-col gap-2 sm:flex-row-reverse">
          <Button
            variant={destructive ? "destructive" : "primary"}
            className="sm:flex-1 aria-disabled:cursor-wait aria-disabled:opacity-60"
            disabled={!isOnline}
            aria-disabled={isPending}
            onClick={() => void confirm()}
          >
            {isPending ? t.confirming : confirmLabel}
          </Button>
          {/* Neither button turns disabled while the answer is awaited, which would drop focus out of the dialog. */}
          <Button
            ref={cancelRef}
            variant="outline"
            className="sm:flex-1 aria-disabled:cursor-wait aria-disabled:opacity-60"
            aria-disabled={isPending}
            onClick={cancel}
          >
            {cancelLabel ?? common.cancel}
          </Button>
        </div>
      </div>
    </dialog>,
    document.body,
  );
}
