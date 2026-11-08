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
import { useMessages } from "@/shared/i18n/use-i18n";
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
  const { common, cards: t } = useMessages();

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 pt-1">
      <Field label={common.name} autoComplete="off" error={errors.name?.message} {...register("name")} />
      <Field
        label={common.amountInPesos}
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
          label={t.card}
          disabled={hasNoCards}
          error={errors.cardId?.message}
          options={[
            { value: "", label: cardIsRequired ? t.chooseCard : t.keepWithoutCard },
            ...cards.map((card) => ({ value: card.id, label: card.name })),
          ]}
          {...register("cardId")}
        />
        {hasNoCards && cardIsRequired ? (
          <p className="text-sm text-muted-foreground">
            {t.needsCard}
          </p>
        ) : null}
      </div>
      <SelectField
        label={common.tag}
        options={[
          { value: "", label: common.noTag },
          ...tags.map((tag) => ({ value: tag.id, label: tag.name })),
        ]}
        {...register("tagId")}
      />
      <div className="flex gap-2">
        <Button type="submit" className="flex-1" disabled={pending || (hasNoCards && cardIsRequired)}>
          {pending ? common.saving : submitLabel}
        </Button>
        <Button variant="outline" className="flex-1" onClick={onCancel}>
          {common.cancel}
        </Button>
      </div>
    </form>
  );
}
