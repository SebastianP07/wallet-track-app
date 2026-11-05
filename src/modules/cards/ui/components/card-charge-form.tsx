"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  cardChargeFormSchema,
  type CardChargeDraft,
  type CardChargeFormValues,
} from "../../domain/card-forms";
import type { CreditCard } from "../../domain/types";
import type { Tag } from "@/modules/tags/domain/types";
import { Button } from "@/shared/ui/button";
import { Field } from "@/shared/ui/field";
import { SelectField } from "@/shared/ui/select-field";

interface CardChargeFormProps {
  defaultValues: CardChargeFormValues;
  cards: CreditCard[];
  // False for a charge whose card was deleted: it can be edited without choosing another.
  cardIsRequired: boolean;
  tags: Tag[];
  submitLabel: string;
  pending?: boolean;
  onSubmit: (draft: CardChargeDraft) => void;
  onCancel: () => void;
}

export function CardChargeForm({
  defaultValues,
  cards,
  cardIsRequired,
  tags,
  submitLabel,
  pending = false,
  onSubmit,
  onCancel,
}: CardChargeFormProps) {
  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors },
  } = useForm<CardChargeFormValues, unknown, CardChargeDraft>({
    resolver: zodResolver(cardChargeFormSchema(cardIsRequired)),
    defaultValues,
  });
  const hasNoCards = cards.length === 0;

  useEffect(() => setFocus("name"), [setFocus]);

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 pt-1">
      <Field label="Name" autoComplete="off" error={errors.name?.message} {...register("name")} />
      <Field
        label="Amount in pesos"
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="0"
        className="font-mono"
        error={errors.amount?.message}
        {...register("amount")}
      />
      <div className="flex flex-col gap-2">
        <SelectField
          label="Card"
          disabled={hasNoCards}
          error={errors.cardId?.message}
          options={[
            { value: "", label: cardIsRequired ? "Choose a card" : "Keep without a card" },
            ...cards.map((card) => ({ value: card.id, label: card.name })),
          ]}
          {...register("cardId")}
        />
        {hasNoCards && cardIsRequired ? (
          <p className="text-sm text-muted-foreground">
            A card charge needs a card. Add your first one under Cards, below.
          </p>
        ) : null}
      </div>
      <SelectField
        label="Tag"
        options={[
          { value: "", label: "No tag" },
          ...tags.map((tag) => ({ value: tag.id, label: tag.name })),
        ]}
        {...register("tagId")}
      />
      <div className="flex gap-2">
        <Button type="submit" className="flex-1" disabled={pending || (hasNoCards && cardIsRequired)}>
          {pending ? "Saving…" : submitLabel}
        </Button>
        <Button variant="outline" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
