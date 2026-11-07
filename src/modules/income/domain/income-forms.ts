import { z } from "@/shared/validation/zod";

import { nameField } from "@/modules/accounts/domain/account-forms";
import { ITEM_AMOUNT_MESSAGE, parseItemAmount } from "@/modules/expenses/domain/expense-forms";

export interface IncomeDraft {
  name: string;
  amount: number;
  tagId: string | null;
  // Only a new income item can ask for this; an edit never sends it.
  repeatsMonthly: boolean;
}

export const incomeFormSchema = z
  .object({ name: nameField, amount: z.string(), tagId: z.string(), repeatsMonthly: z.boolean().optional() })
  .superRefine((values, context) => {
    if (parseItemAmount(values.amount) === null) {
      context.addIssue({ code: "custom", path: ["amount"], message: ITEM_AMOUNT_MESSAGE });
    }
  })
  .transform(
    (values): IncomeDraft => ({
      name: values.name,
      amount: parseItemAmount(values.amount) ?? 0,
      tagId: values.tagId || null,
      repeatsMonthly: values.repeatsMonthly ?? false,
    }),
  );

export type IncomeFormValues = z.input<typeof incomeFormSchema>;
