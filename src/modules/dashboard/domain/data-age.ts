import type { Messages } from "@/shared/i18n/messages";

const MINUTE_MS = 60_000;

export function describeDataAge(ageMs: number, messages: Messages): string {
  const t = messages.dashboard.offline;
  const minutes = Math.floor(ageMs / MINUTE_MS);
  if (minutes < 1) {
    return t.lessThanMinuteAgo;
  }
  if (minutes < 60) {
    return t.minutesAgo(minutes);
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return t.hoursAgo(hours);
  }
  return t.daysAgo(Math.floor(hours / 24));
}
