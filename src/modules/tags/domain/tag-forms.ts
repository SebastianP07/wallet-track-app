import { issue } from "@/shared/i18n/validation-key";
import { z } from "@/shared/validation/zod";

import { nameField } from "@/modules/accounts/domain/account-forms";

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export const DEFAULT_TAG_COLOR = "#3b82f6";

export const tagFormSchema = z.object({
  name: nameField,
  color: z.string().regex(HEX_COLOR, { error: issue("color") }),
});

export type TagFormValues = z.input<typeof tagFormSchema>;
