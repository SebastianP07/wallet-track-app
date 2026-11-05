import { describeExpenseFailure } from "@/modules/expenses/domain/failures";

export function describeOverdueFailure(status: number): string {
  return status === 404
    ? "That item no longer exists, so it has left this list."
    : describeExpenseFailure(status);
}
