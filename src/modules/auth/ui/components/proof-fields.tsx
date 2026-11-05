"use client";

import type { UseFormRegisterReturn } from "react-hook-form";

import { PROOF_METHODS } from "../../domain/security-forms";
import type { SecondFactorProof } from "../../domain/types";
import { Field } from "@/shared/ui/field";
import { SelectField } from "@/shared/ui/select-field";

interface ProofFieldsProps {
  method: SecondFactorProof["method"];
  codeError?: string;
  methodField: UseFormRegisterReturn;
  codeField: UseFormRegisterReturn;
}

export function ProofFields({ method, codeError, methodField, codeField }: ProofFieldsProps) {
  const isTotp = method === "totp";
  return (
    <>
      <SelectField label="Confirm with" options={PROOF_METHODS} {...methodField} />
      <Field
        label={isTotp ? "Authenticator code" : "Recovery code"}
        hint={isTotp ? undefined : "Each recovery code works once, and this uses it up."}
        type="text"
        inputMode={isTotp ? "numeric" : "text"}
        autoComplete={isTotp ? "one-time-code" : "off"}
        autoCapitalize={isTotp ? undefined : "characters"}
        spellCheck={false}
        maxLength={isTotp ? 6 : 64}
        className="font-mono"
        error={codeError}
        {...codeField}
      />
    </>
  );
}
