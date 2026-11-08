"use client";

import type { UseFormRegisterReturn } from "react-hook-form";

import { PROOF_METHODS } from "../../domain/security-forms";
import type { SecondFactorProof } from "../../domain/types";
import { useMessages } from "@/shared/i18n/use-i18n";
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
  const t = useMessages().security;
  return (
    <>
      <SelectField
        label={t.confirmWith}
        options={PROOF_METHODS.map((value) => ({ value, label: t.proofMethods[value] }))}
        {...methodField}
      />
      <Field
        label={t.proofMethods[method]}
        hint={isTotp ? undefined : t.recoveryCodeHint}
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
