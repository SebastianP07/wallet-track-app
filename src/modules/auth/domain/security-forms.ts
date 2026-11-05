import { z } from "@/shared/validation/zod";

import { nameField } from "@/modules/accounts/domain/account-forms";

import type { SecondFactorProof } from "./types";

export const PROOF_METHODS: readonly { value: SecondFactorProof["method"]; label: string }[] = [
  { value: "totp", label: "Authenticator code" },
  { value: "recovery_code", label: "Recovery code" },
];

const proofFields = {
  method: z.enum(["totp", "recovery_code"]),
  code: z.string().trim(),
};

function checkCode(
  { method, code }: { method: SecondFactorProof["method"]; code: string },
  context: z.RefinementCtx,
) {
  if (method === "totp" && !/^[0-9]{6}$/.test(code)) {
    context.addIssue({ code: "custom", path: ["code"], message: "Enter the 6-digit code from your authenticator." });
  }
  if (method === "recovery_code" && (code.length < 1 || code.length > 64)) {
    context.addIssue({ code: "custom", path: ["code"], message: "Enter a recovery code." });
  }
}

export const proofSchema = z.object(proofFields).superRefine(checkCode);
export type ProofValues = z.input<typeof proofSchema>;

export const addPasskeySchema = z.object({ name: nameField, ...proofFields }).superRefine(checkCode);
export type AddPasskeyValues = z.input<typeof addPasskeySchema>;

export const passkeyNameSchema = z.object({ name: nameField });
export type PasskeyNameValues = z.input<typeof passkeyNameSchema>;

export const toProof = ({ method, code }: ProofValues): SecondFactorProof => ({ method, code });
