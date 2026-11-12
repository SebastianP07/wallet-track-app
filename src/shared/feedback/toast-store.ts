export type ToastTone = "success" | "error";

export interface Toast {
  id: number;
  tone: ToastTone;
  message: string;
}

const MAX_VISIBLE = 3;
// Long enough to read a sentence; an error stays longer, as it may ask for something to be done.
export const TOAST_DURATION_MS: Record<ToastTone, number> = { success: 4000, error: 8000 };

let toasts: Toast[] = [];
let nextId = 0;
const timers = new Map<number, ReturnType<typeof setTimeout>>();
const listeners = new Set<() => void>();

function publish(next: Toast[]) {
  toasts = next;
  listeners.forEach((listener) => listener());
}

export function dismissToast(id: number) {
  clearTimeout(timers.get(id));
  timers.delete(id);
  if (toasts.some((toast) => toast.id === id)) {
    publish(toasts.filter((toast) => toast.id !== id));
  }
}

function show(tone: ToastTone, message: string) {
  // The same notice again, as a run of quick moves gives, replaces the earlier one instead of stacking.
  toasts.filter((toast) => toast.tone === tone && toast.message === message).forEach((toast) => dismissToast(toast.id));
  toasts.slice(0, Math.max(0, toasts.length - MAX_VISIBLE + 1)).forEach((oldest) => dismissToast(oldest.id));
  const toast: Toast = { id: ++nextId, tone, message };
  publish([...toasts, toast]);
  timers.set(toast.id, setTimeout(() => dismissToast(toast.id), TOAST_DURATION_MS[tone]));
}

export const notify = {
  success: (message: string) => show("success", message),
  error: (message: string) => show("error", message),
};

export function subscribeToToasts(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getToasts(): Toast[] {
  return toasts;
}

const NO_TOASTS: Toast[] = [];

export function getServerToasts(): Toast[] {
  return NO_TOASTS;
}
