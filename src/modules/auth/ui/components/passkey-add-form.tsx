"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { addPasskeySchema, toProof, type AddPasskeyValues } from "../../domain/security-forms";
import type { SecondFactorProof } from "../../domain/types";
import { ProofFields } from "./proof-fields";
import { useMessages } from "@/shared/i18n/use-i18n";
import { Button } from "@/shared/ui/button";
import { Field } from "@/shared/ui/field";

interface PasskeyAddFormProps {
  pending: boolean;
  onSubmit: (name: string, proof: SecondFactorProof, callbacks: { onFailure: () => void }) => void;
  onCancel: () => void;
}

export function PasskeyAddForm({ pending, onSubmit, onCancel }: PasskeyAddFormProps) {
  const {
    register,
    handleSubmit,
    resetField,
    setFocus,
    control,
    formState: { errors },
  } = useForm<AddPasskeyValues>({
    resolver: zodResolver(addPasskeySchema),
    defaultValues: { name: "", method: "totp", code: "" },
  });

  const method = useWatch({ control, name: "method" });

  useEffect(() => setFocus("name"), [setFocus]);
  const { common, security: t } = useMessages();

  return (
    <form
      noValidate
      className="flex flex-col gap-3 pt-1 md:max-w-md"
      onSubmit={handleSubmit((values) =>
        onSubmit(values.name, toProof(values), {
          onFailure: () => {
            resetField("code");
            setFocus("code");
          },
        }),
      )}
    >
      <Field
        label={t.passkeyName}
        hint={t.passkeyNameHint}
        autoComplete="off"
        error={errors.name?.message}
        {...register("name")}
      />
      <ProofFields
        method={method}
        codeError={errors.code?.message}
        methodField={register("method")}
        codeField={register("code")}
      />
      <div className="flex gap-2">
        <Button type="submit" className="flex-1" disabled={pending}>
          {pending ? t.waiting : t.addPasskey}
        </Button>
        <Button variant="outline" className="flex-1" onClick={onCancel}>
          {common.cancel}
        </Button>
      </div>
    </form>
  );
}
