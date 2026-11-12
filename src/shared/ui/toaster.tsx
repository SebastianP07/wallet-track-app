"use client";

import { useSyncExternalStore } from "react";
import { CircleAlert, CircleCheck, X } from "lucide-react";
import { cn } from "cn";

import {
  dismissToast,
  getServerToasts,
  getToasts,
  subscribeToToasts,
  type Toast,
  type ToastTone,
} from "@/shared/feedback/toast-store";
import { useMessages } from "@/shared/i18n/use-i18n";

const ICONS = { success: CircleCheck, error: CircleAlert };

function ToastItem({ toast }: { toast: Toast }) {
  const t = useMessages().feedback;
  const Icon = ICONS[toast.tone];
  return (
    <div
      className={cn(
        "rise-in pointer-events-auto flex items-start gap-3 rounded-lg border bg-card py-2 pr-1 pl-3 text-sm text-card-foreground shadow-[0_8px_24px_rgb(0_0_0/0.5)]",
        toast.tone === "error" ? "border-destructive/60" : "border-border",
      )}
    >
      <Icon
        aria-hidden="true"
        className={cn("mt-2.5 size-4 shrink-0", toast.tone === "error" ? "text-destructive" : "text-signal")}
      />
      <p className="min-w-0 flex-1 py-2 wrap-anywhere">{toast.message}</p>
      <button
        type="button"
        aria-label={t.dismiss}
        onClick={() => dismissToast(toast.id)}
        className="inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <X aria-hidden="true" className="size-4" />
      </button>
    </div>
  );
}

function ToastList({ toasts, tone }: { toasts: Toast[]; tone: ToastTone }) {
  // Both stay mounted while empty: screen readers announce changes to a live region they already know.
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      aria-live={tone === "error" ? "assertive" : "polite"}
      className="flex flex-col gap-2 empty:hidden"
    >
      {toasts
        .filter((toast) => toast.tone === tone)
        .map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
    </div>
  );
}

// Mounted once for the whole app. Its distance from the bottom, which clears the Dashboard's navigation, is in the
// global styles.
export function Toaster() {
  const toasts = useSyncExternalStore(subscribeToToasts, getToasts, getServerToasts);
  return (
    <div className="toaster pointer-events-none fixed inset-x-0 z-40 mx-auto flex w-full max-w-md flex-col gap-2 px-4">
      <ToastList toasts={toasts} tone="error" />
      <ToastList toasts={toasts} tone="success" />
    </div>
  );
}
