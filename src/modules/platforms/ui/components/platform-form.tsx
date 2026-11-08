"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  platformFormSchema,
  type PlatformDraft,
  type PlatformFormValues,
} from "../../domain/platform-forms";
import type { CreditCard } from "@/modules/cards/domain/types";
import { useMessages } from "@/shared/i18n/use-i18n";
import { Button } from "@/shared/ui/button";
import { Field } from "@/shared/ui/field";
import { SelectField } from "@/shared/ui/select-field";

interface PlatformFormProps {
  defaultValues: PlatformFormValues;
  cards: CreditCard[];
  submitLabel: string;
  pending: boolean;
  onSubmit: (platform: PlatformDraft) => void;
  onCancel: () => void;
}

export function PlatformForm({
  defaultValues,
  cards,
  submitLabel,
  pending,
  onSubmit,
  onCancel,
}: PlatformFormProps) {
  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors },
  } = useForm<PlatformFormValues, unknown, PlatformDraft>({
    resolver: zodResolver(platformFormSchema),
    defaultValues,
  });

  useEffect(() => setFocus("name"), [setFocus]);
  const { common, platforms: t } = useMessages();

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 pt-1">
      <Field label={t.platformName} autoComplete="off" error={errors.name?.message} {...register("name")} />
      <Field
        label={t.monthlyCost}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="0"
        className="font-mono"
        error={errors.monthlyCost?.message}
        {...register("monthlyCost")}
      />
      <SelectField
        label={t.card}
        options={[
          { value: "", label: t.noCard },
          ...cards.map((card) => ({ value: card.id, label: card.name })),
        ]}
        {...register("cardId")}
      />
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
