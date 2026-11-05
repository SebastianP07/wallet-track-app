import { z } from "@/shared/validation/zod";

import type { TemplateCreate, TemplateUpdate } from "./types";
import { nameField } from "@/modules/accounts/domain/account-forms";
import { parseCopInput } from "@/modules/accounts/domain/money";

const DUE_DAY = /^(0?[1-9]|[12][0-9]|3[01])$/;

function parseAmount(raw: string): number | null {
  const parsed = parseCopInput(raw);
  return parsed.ok && parsed.value >= 0 ? parsed.value : null;
}

// Every rule sits at this one level, so that a form with several mistakes reports them all at once.
export const templateFormSchema = z
  .object({
    kind: z.enum(["fixed", "income", "card_charge"]),
    name: nameField,
    amount: z.string(),
    dueDay: z.string(),
    cardId: z.string(),
    tagId: z.string(),
  })
  .superRefine((values, context) => {
    if (parseAmount(values.amount) === null) {
      context.addIssue({
        code: "custom",
        path: ["amount"],
        message: "Enter whole pesos, zero or more, like 1.250.000. No decimals.",
      });
    }
    if (values.kind === "fixed" && !DUE_DAY.test(values.dueDay.trim())) {
      context.addIssue({
        code: "custom",
        path: ["dueDay"],
        message: "Enter a day between 1 and 31.",
      });
    }
    if (values.kind === "card_charge" && !values.cardId) {
      context.addIssue({ code: "custom", path: ["cardId"], message: "Choose a card." });
    }
  })
  .transform((values): TemplateCreate => {
    const { kind, name } = values;
    const amount = parseAmount(values.amount) ?? 0;
    const tagId = values.tagId || null;
    switch (kind) {
      case "fixed":
        return { kind, name, amount, dueDay: Number(values.dueDay.trim()), tagId, active: true };
      case "income":
        return { kind, name, amount, tagId, active: true };
      case "card_charge":
        return { kind, name, amount, cardId: values.cardId, tagId, active: true };
    }
  });

export type TemplateFormValues = z.input<typeof templateFormSchema>;

// The kind never changes on an edit, so it is not part of the changes.
export function toTemplateUpdate(draft: TemplateCreate): TemplateUpdate {
  const { name, amount, tagId } = draft;
  switch (draft.kind) {
    case "fixed":
      return { name, amount, tagId, dueDay: draft.dueDay };
    case "income":
      return { name, amount, tagId };
    case "card_charge":
      return { name, amount, tagId, cardId: draft.cardId };
  }
}
