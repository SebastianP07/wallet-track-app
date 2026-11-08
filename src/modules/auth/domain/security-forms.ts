import { issue } from "@/shared/i18n/validation-key";
import { z } from "@/shared/validation/zod";

import { nameField } from "@/modules/accounts/domain/account-forms";

import type { SecondFactorProof } from "./types";

// Labels live in the messages, under security.proofMethods.
export const PROOF_METHODS: readonly SecondFactorProof["method"][] = ["totp", "recovery_code"];

const proofFields = {
  method: z.enum(["totp", "recovery_code"]),
  code: z.string().trim(),
};

function checkCode(
  { method, code }: { method: SecondFactorProof["method"]; code: string },
  context: z.RefinementCtx,
) {
  if (method === "totp" && !/^[0-9]{6}$/.test(code)) {
    context.addIssue({ code: "custom", path: ["code"], message: issue("totpCode") });
  }
  if (method === "recovery_code" && (code.length < 1 || code.length > 64)) {
    context.addIssue({ code: "custom", path: ["code"], message: issue("recoveryCode") });
  }
}

export const proofSchema = z.object(proofFields).superRefine(checkCode);
export type ProofValues = z.input<typeof proofSchema>;

export const addPasskeySchema = z.object({ name: nameField, ...proofFields }).superRefine(checkCode);
export type AddPasskeyValues = z.input<typeof addPasskeySchema>;

export const passkeyNameSchema = z.object({ name: nameField });
export type PasskeyNameValues = z.input<typeof passkeyNameSchema>;

export const toProof = ({ method, code }: ProofValues): SecondFactorProof => ({ method, code });
