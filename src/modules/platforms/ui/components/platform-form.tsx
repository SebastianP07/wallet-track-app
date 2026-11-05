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

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 pt-1">
      <Field label="Platform name" autoComplete="off" error={errors.name?.message} {...register("name")} />
      <Field
        label="Monthly cost in pesos"
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="0"
        className="font-mono"
        error={errors.monthlyCost?.message}
        {...register("monthlyCost")}
      />
      <SelectField
        label="Card"
        options={[
          { value: "", label: "No card" },
          ...cards.map((card) => ({ value: card.id, label: card.name })),
        ]}
        {...register("cardId")}
      />
      <div className="flex gap-2">
        <Button type="submit" className="flex-1" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
        <Button variant="outline" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
