"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { proofSchema, toProof, type ProofValues } from "../../domain/security-forms";
import type { SecondFactorProof } from "../../domain/types";
import { ProofFields } from "./proof-fields";
import { Button } from "@/shared/ui/button";

interface PasskeyRemoveFormProps {
  name: string;
  isLast: boolean;
  pending: boolean;
  onSubmit: (proof: SecondFactorProof, callbacks: { onFailure: () => void }) => void;
  onCancel: () => void;
}

export function PasskeyRemoveForm({ name, isLast, pending, onSubmit, onCancel }: PasskeyRemoveFormProps) {
  const {
    register,
    handleSubmit,
    resetField,
    setFocus,
    control,
    formState: { errors },
  } = useForm<ProofValues>({
    resolver: zodResolver(proofSchema),
    defaultValues: { method: "totp", code: "" },
  });

  const method = useWatch({ control, name: "method" });

  useEffect(() => setFocus("code"), [setFocus]);

  return (
    <form
      noValidate
      className="flex flex-col gap-3 pt-1 md:max-w-md"
      onSubmit={handleSubmit((values) =>
        onSubmit(toProof(values), {
          onFailure: () => {
            resetField("code");
            setFocus("code");
          },
        }),
      )}
    >
      <p className="text-sm">
        Remove <span className="font-medium wrap-anywhere">{name}</span> for good?{" "}
        {isLast
          ? "It's your only passkey, so you'll sign in with your authenticator from now on."
          : "Your other passkeys keep working."}
      </p>
      <ProofFields
        method={method}
        codeError={errors.code?.message}
        methodField={register("method")}
        codeField={register("code")}
      />
      <div className="flex gap-2">
        <Button type="submit" variant="destructive" className="flex-1" disabled={pending}>
          {pending ? "Removing…" : "Remove"}
        </Button>
        <Button variant="outline" className="flex-1" onClick={onCancel}>
          Keep it
        </Button>
      </div>
    </form>
  );
}
