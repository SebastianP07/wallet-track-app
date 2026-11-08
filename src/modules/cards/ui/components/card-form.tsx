"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { cardFormSchema, type CardDraft, type CardFormValues } from "../../domain/card-forms";
import { useMessages } from "@/shared/i18n/use-i18n";
import { Button } from "@/shared/ui/button";
import { Field } from "@/shared/ui/field";

interface CardFormProps {
  defaultValues: CardFormValues;
  submitLabel: string;
  pending: boolean;
  onSubmit: (card: CardDraft) => void;
  onCancel: () => void;
}

export function CardForm({ defaultValues, submitLabel, pending, onSubmit, onCancel }: CardFormProps) {
  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors },
  } = useForm<CardFormValues, unknown, CardDraft>({
    resolver: zodResolver(cardFormSchema),
    defaultValues,
  });

  useEffect(() => setFocus("name"), [setFocus]);
  const { common, cards: t } = useMessages();

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 pt-1">
      <Field label={t.cardName} autoComplete="off" error={errors.name?.message} {...register("name")} />
      <Field label={t.issuer} autoComplete="off" error={errors.issuer?.message} {...register("issuer")} />
      <div className="grid grid-cols-2 gap-3">
        <Field
          label={t.statementDay}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          className="font-mono"
          error={errors.statementDay?.message}
          {...register("statementDay")}
        />
        <Field
          label={t.dueDay}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          className="font-mono"
          error={errors.dueDay?.message}
          {...register("dueDay")}
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" className="flex-1" disabled={pending}>
          {pending ? common.saving : submitLabel}
        </Button>
        <Button variant="outline" className="flex-1" onClick={onCancel}>
          {common.cancel}
        </Button>
      </div>
    </form>
  );
}
