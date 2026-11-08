import type { Messages } from "@/shared/i18n/messages";

const NOT_FOUND = 404;
const TOO_MANY_REQUESTS = 429;
const NETWORK_FAILURE = 0;

export function describeExportFailure(status: number, messages: Messages): string {
  const t = messages.dashboard.export;
  switch (status) {
    case NOT_FOUND:
      return t.notOpened;
    case TOO_MANY_REQUESTS:
      return t.tooMany;
    case NETWORK_FAILURE:
      return t.offline;
    default:
      return t.failed;
  }
}
