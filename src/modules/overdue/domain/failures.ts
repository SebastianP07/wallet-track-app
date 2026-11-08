import { describeExpenseFailure } from "@/modules/expenses/domain/failures";
import type { Messages } from "@/shared/i18n/messages";

export function describeOverdueFailure(status: number, messages: Messages): string {
  return status === 404 ? messages.overdue.notFound : describeExpenseFailure(status, messages);
}
