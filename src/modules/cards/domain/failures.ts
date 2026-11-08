import type { Messages } from "@/shared/i18n/messages";

export function describeCardFailure(status: number, messages: Messages): string {
  switch (status) {
    case 400:
      return messages.cards.failures.rejected;
    case 403:
      return messages.common.unverified;
    case 404:
      return messages.cards.failures.notFound;
    default:
      return messages.common.unreachable;
  }
}
