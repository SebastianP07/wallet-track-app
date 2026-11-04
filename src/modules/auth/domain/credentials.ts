import { z } from "zod";

export const passwordLoginSchema = z.object({
  email: z.string().trim().pipe(z.email({ error: "Enter a valid email address." })),
  password: z
    .string()
    .min(1, { error: "Enter your password." })
    .max(1024, { error: "That password is too long." }),
});

export const totpCodeSchema = z.object({
  value: z
    .string()
    .trim()
    .regex(/^[0-9]{6}$/, { error: "Enter the 6-digit code from your authenticator." }),
});

export const recoveryCodeSchema = z.object({
  value: z
    .string()
    .trim()
    .min(1, { error: "Enter a recovery code." })
    .max(64, { error: "That recovery code is too long." }),
});

export const enrollmentSecretSchema = z.object({
  value: z
    .string()
    .trim()
    .min(1, { error: "Enter the enrollment secret." })
    .max(128, { error: "That enrollment secret is too long." }),
});
