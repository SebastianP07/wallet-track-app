import type { Messages } from "@/shared/i18n/messages";

// What a 409 means depends on the write: which of these it is.
export type PlatformConflict = "ownerConflict" | "personHasPayments";

export function describePlatformFailure(status: number, messages: Messages, conflict?: PlatformConflict): string {
  const t = messages.platforms.failures;
  switch (status) {
    case 400:
      return t.rejected;
    case 403:
      return messages.common.unverified;
    case 404:
      return t.notFound;
    case 409:
      return conflict ? t[conflict] : t.conflict;
    default:
      return messages.common.unreachable;
  }
}
