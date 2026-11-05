import { z } from "@/shared/validation/zod";

import { nameField } from "@/modules/accounts/domain/account-forms";
import { ITEM_AMOUNT_MESSAGE, parseItemAmount } from "@/modules/expenses/domain/expense-forms";

export interface IncomeDraft {
  name: string;
  amount: number;
  tagId: string | null;
}

export const incomeFormSchema = z
  .object({ name: nameField, amount: z.string(), tagId: z.string() })
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
    }),
  );

export type IncomeFormValues = z.input<typeof incomeFormSchema>;
