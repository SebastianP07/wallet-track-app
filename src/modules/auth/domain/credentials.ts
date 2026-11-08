import { issue } from "@/shared/i18n/validation-key";
import { z } from "@/shared/validation/zod";

export const passwordLoginSchema = z.object({
  email: z.string().trim().pipe(z.email({ error: issue("email") })),
  password: z
    .string()
    .min(1, { error: issue("password") })
    .max(1024, { error: issue("passwordTooLong") }),
});

export const totpCodeSchema = z.object({
  value: z
    .string()
    .trim()
    .regex(/^[0-9]{6}$/, { error: issue("totpCode") }),
});

export const recoveryCodeSchema = z.object({
  value: z
    .string()
    .trim()
    .min(1, { error: issue("recoveryCode") })
    .max(64, { error: issue("recoveryCodeTooLong") }),
});

export const enrollmentSecretSchema = z.object({
  value: z
    .string()
    .trim()
    .min(1, { error: issue("enrollmentSecret") })
    .max(128, { error: issue("enrollmentSecretTooLong") }),
});
