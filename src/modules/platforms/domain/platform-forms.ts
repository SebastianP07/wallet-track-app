import { z } from "@/shared/validation/zod";

import { nameField } from "@/modules/accounts/domain/account-forms";
import { ITEM_AMOUNT_MESSAGE, parseItemAmount } from "@/modules/expenses/domain/expense-forms";
import { currentYearMonth } from "@/modules/periods/domain/year-month";

const MONTHS = /^0*([1-9][0-9]?|1[01][0-9]|120)$/;
const MONTHS_MESSAGE = "Enter a whole number of months, from 1 to 120.";
const DATE = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
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
  paidAt: z
    .string()
    .refine((value) => DATE.test(value) && value >= FIRST_DATE && value <= LAST_DATE, {
      error: "Choose the date of the payment.",
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

export function billingFrequency(months: number): string {
  switch (months) {
    case 1:
      return "Monthly";
    case 6:
      return "Semiannual";
    case 12:
      return "Yearly";
    default:
      return `Every ${months} months`;
  }
}

export function formatDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1)));
}
