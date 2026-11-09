import { isCalendarDate } from "@/shared/format/date-input";
import { issue } from "@/shared/i18n/validation-key";
import { dateIssue } from "@/shared/validation/date";
import { z } from "@/shared/validation/zod";

import { nameField } from "@/modules/accounts/domain/account-forms";
import { parseCopInput } from "@/modules/accounts/domain/money";

const FIRST_DUE_DATE = "2000-01-01";

export const ITEM_AMOUNT_MESSAGE = issue("itemAmount");

export function parseItemAmount(raw: string): number | null {
  const parsed = parseCopInput(raw);
  return parsed.ok && parsed.value >= 0 ? parsed.value : null;
}

function isDueDate(raw: string): boolean {
  return isCalendarDate(raw) && raw >= FIRST_DUE_DATE;
}

export interface ExpenseDraft {
  name: string;
  amount: number;
  dueDate: string;
  tagId: string | null;
  // Only a new fixed expense can ask for this; an edit never sends it.
  repeatsMonthly: boolean;
}

export const expenseFormSchema = z
  .object({
    name: nameField,
    amount: z.string(),
    dueDate: z.string(),
    tagId: z.string(),
    repeatsMonthly: z.boolean().optional(),
  })
  .superRefine((values, context) => {
    if (parseItemAmount(values.amount) === null) {
      context.addIssue({ code: "custom", path: ["amount"], message: ITEM_AMOUNT_MESSAGE });
    }
    if (!isDueDate(values.dueDate)) {
      context.addIssue({ code: "custom", path: ["dueDate"], message: dateIssue(values.dueDate, "dueDate") });
    }
  })
  .transform(
    (values): ExpenseDraft => ({
      name: values.name,
      amount: parseItemAmount(values.amount) ?? 0,
      dueDate: values.dueDate,
      tagId: values.tagId || null,
      repeatsMonthly: values.repeatsMonthly ?? false,
    }),
  );

export type ExpenseFormValues = z.input<typeof expenseFormSchema>;
