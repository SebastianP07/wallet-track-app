import { isCalendarDate } from "@/shared/format/date-input";
import { issue } from "@/shared/i18n/validation-key";
import { dateIssue } from "@/shared/validation/date";
import { z } from "@/shared/validation/zod";

import { nameField } from "@/modules/accounts/domain/account-forms";
import { ITEM_AMOUNT_MESSAGE, parseItemAmount } from "@/modules/expenses/domain/expense-forms";
import { currentYearMonth } from "@/modules/periods/domain/year-month";
import type { Messages } from "@/shared/i18n/messages";

const MONTHS = /^0*([1-9][0-9]?|1[01][0-9]|120)$/;
const MONTHS_MESSAGE = issue("months");
const FIRST_DATE = "2000-01-01";
const LAST_DATE = "9989-12-31";

const monthsField = z
  .string()
  .refine((value) => MONTHS.test(value.trim()), { error: MONTHS_MESSAGE })
  .transform((value) => Number(value.trim()));

export const personFormSchema = z.object({
  name: nameField,
  billingMonths: monthsField,
  isOwner: z.boolean(),
});

export type PersonFormValues = z.input<typeof personFormSchema>;
export type PersonDraft = z.output<typeof personFormSchema>;

export const paymentFormSchema = z.object({
  paidAt: z.string().superRefine((value, context) => {
    if (!(isCalendarDate(value) && value >= FIRST_DATE && value <= LAST_DATE)) {
      context.addIssue({ code: "custom", message: dateIssue(value, "paymentDate") });
    }
  }),
  monthsCovered: monthsField,
});

export type PaymentFormValues = z.input<typeof paymentFormSchema>;
export type PaymentDraft = z.output<typeof paymentFormSchema>;

export interface PlatformDraft {
  name: string;
  monthlyCost: number;
  cardId: string | null;
}

export const platformFormSchema = z
  .object({ name: nameField, monthlyCost: z.string(), cardId: z.string() })
  .superRefine((values, context) => {
    if (parseItemAmount(values.monthlyCost) === null) {
      context.addIssue({ code: "custom", path: ["monthlyCost"], message: ITEM_AMOUNT_MESSAGE });
    }
  })
  .transform(
    (values): PlatformDraft => ({
      name: values.name,
      monthlyCost: parseItemAmount(values.monthlyCost) ?? 0,
      cardId: values.cardId || null,
    }),
  );

export type PlatformFormValues = z.input<typeof platformFormSchema>;

// Today when the selected month is the current one, or else a day of that month, because coverage
// counts from the month of the date.
export function defaultPaymentDate(period: string, now: Date): string {
  if (period !== currentYearMonth(now)) {
    return `${period}-01`;
  }
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(now);
}

export function billingFrequency(months: number, messages: Messages): string {
  const t = messages.platforms;
  switch (months) {
    case 1:
      return t.monthly;
    case 6:
      return t.semiannual;
    case 12:
      return t.yearly;
    default:
      return t.everyMonths(months);
  }
}
