import { issue } from "@/shared/i18n/validation-key";
import { z } from "@/shared/validation/zod";

import type { CreditCardCreate } from "./types";
import { nameField } from "@/modules/accounts/domain/account-forms";
import { ITEM_AMOUNT_MESSAGE, parseItemAmount } from "@/modules/expenses/domain/expense-forms";

const DAY = /^(0?[1-9]|[12][0-9]|3[01])$/;
const DAY_MESSAGE = issue("day");

const dayField = z
  .string()
  .refine((value) => DAY.test(value.trim()), { error: DAY_MESSAGE })
  .transform((value) => Number(value.trim()));

export const cardFormSchema = z.object({
  name: nameField,
  issuer: nameField,
  statementDay: dayField,
  dueDay: dayField,
});

export type CardFormValues = z.input<typeof cardFormSchema>;
export type CardDraft = CreditCardCreate;

export interface CardChargeDraft {
  name: string;
  amount: number;
  // Empty only when editing a charge whose card was deleted, and no other card was chosen.
  cardId: string;
  tagId: string | null;
}

// A new charge has to have a card. One whose card was deleted can be edited without choosing another.
export function cardChargeFormSchema(cardIsRequired: boolean) {
  return z
    .object({ name: nameField, amount: z.string(), cardId: z.string(), tagId: z.string() })
    .superRefine((values, context) => {
      if (parseItemAmount(values.amount) === null) {
        context.addIssue({ code: "custom", path: ["amount"], message: ITEM_AMOUNT_MESSAGE });
      }
      if (cardIsRequired && !values.cardId) {
        context.addIssue({ code: "custom", path: ["cardId"], message: issue("card") });
      }
    })
    .transform(
      (values): CardChargeDraft => ({
        name: values.name,
        amount: parseItemAmount(values.amount) ?? 0,
        cardId: values.cardId,
        tagId: values.tagId || null,
      }),
    );
}

export type CardChargeFormValues = z.input<ReturnType<typeof cardChargeFormSchema>>;
