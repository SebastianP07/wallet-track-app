import type { Messages } from "@/shared/i18n/messages";

export function describeTagFailure(status: number, messages: Messages): string {
  const t = messages.tags.failures;
  switch (status) {
    case 400:
      return t.rejected;
    case 403:
      return messages.common.unverified;
    case 404:
      return t.notFound;
    case 409:
      return t.nameTaken;
    default:
      return messages.common.unreachable;
  }
}
