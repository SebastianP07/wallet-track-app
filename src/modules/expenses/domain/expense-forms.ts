import { z } from "@/shared/validation/zod";

import { nameField } from "@/modules/accounts/domain/account-forms";
import { parseCopInput } from "@/modules/accounts/domain/money";

const DATE = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
const FIRST_DUE_DATE = "2000-01-01";

function parseAmount(raw: string): number | null {
  const parsed = parseCopInput(raw);
  return parsed.ok && parsed.value >= 0 ? parsed.value : null;
}

function isDueDate(raw: string): boolean {
  return DATE.test(raw) && raw >= FIRST_DUE_DATE && !Number.isNaN(Date.parse(`${raw}T00:00:00Z`));
}

export interface ExpenseDraft {
  name: string;
  amount: number;
  dueDate: string;
  tagId: string | null;
}

export const expenseFormSchema = z
  .object({ name: nameField, amount: z.string(), dueDate: z.string(), tagId: z.string() })
  .superRefine((values, context) => {
    if (parseAmount(values.amount) === null) {
      context.addIssue({
        code: "custom",
        path: ["amount"],
        message: "Enter whole pesos, zero or more, like 1.250.000. No decimals.",
      });
    }
    if (!isDueDate(values.dueDate)) {
      context.addIssue({ code: "custom", path: ["dueDate"], message: "Choose a due date." });
    }
  })
  .transform(
    (values): ExpenseDraft => ({
      name: values.name,
      amount: parseAmount(values.amount) ?? 0,
      dueDate: values.dueDate,
      tagId: values.tagId || null,
    }),
  );

export type ExpenseFormValues = z.input<typeof expenseFormSchema>;
