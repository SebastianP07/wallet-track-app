import type { Messages } from "@/shared/i18n/messages";

export function describePeriodFailure(status: number, messages: Messages): string {
  switch (status) {
    case 400:
      return messages.periods.failures.periodRejected;
    case 403:
      return messages.common.unverified;
    case 404:
      return messages.periods.failures.periodNotFound;
    default:
      return messages.common.unreachable;
  }
}

export function describeTemplateFailure(status: number, messages: Messages): string {
  switch (status) {
    case 400:
      return messages.periods.failures.templateRejected;
    case 403:
      return messages.common.unverified;
    case 404:
      return messages.periods.failures.templateNotFound;
    default:
      return messages.common.unreachable;
  }
}
