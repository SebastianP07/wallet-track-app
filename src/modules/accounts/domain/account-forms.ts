import { z } from "zod";

import { parseCopInput } from "./money";

const NAME_MAX_CHARS = 120;
// Matches the backend, which counts code points and refuses control characters.
const CONTROL_CHARACTERS = /\p{Cc}/u;

export const nameField = z
  .string()
  .trim()
  .min(1, { error: "Enter a name." })
  .refine((value) => Array.from(value).length <= NAME_MAX_CHARS, {
    error: "Use at most 120 characters.",
  })
  .refine((value) => !CONTROL_CHARACTERS.test(value), { error: "Use only printable characters." });

const pesos = (emptyMeansZero: boolean) =>
  z.string().transform((raw, context) => {
    const parsed = parseCopInput(emptyMeansZero && raw.trim() === "" ? "0" : raw);
    if (!parsed.ok) {
      context.addIssue({ code: "custom", message: parsed.error });
      return z.NEVER;
    }
    return parsed.value;
  });

export const accountNameSchema = z.object({ name: nameField });

export const accountBalanceSchema = z.object({ balance: pesos(false) });

export const newAccountSchema = z.object({
  name: nameField,
  kind: z.enum(["bank", "wallet", "cash", "food_card", "savings"]),
  balance: pesos(true),
});
