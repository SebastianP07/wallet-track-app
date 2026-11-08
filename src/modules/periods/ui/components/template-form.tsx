"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import {
  templateFormSchema,
  type TemplateFormValues,
} from "../../domain/template-forms";
import { TEMPLATE_KINDS } from "../../domain/template-groups";
import type { CreditCard, TemplateCreate } from "../../domain/types";
import type { Tag } from "@/modules/tags/domain/types";
import { useMessages } from "@/shared/i18n/use-i18n";
import { Button } from "@/shared/ui/button";
import { Field } from "@/shared/ui/field";
import { SelectField } from "@/shared/ui/select-field";

export interface CardChoices {
  cards: CreditCard[];
  isLoading: boolean;
  loadFailed: boolean;
  reload: () => void;
}

interface TemplateFormProps {
  defaultValues: TemplateFormValues;
  // A template's kind never changes, so only a new one can choose it.
  canChooseKind: boolean;
  cardChoices: CardChoices;
  tags: Tag[];
  submitLabel: string;
  pending?: boolean;
  onSubmit: (template: TemplateCreate) => void;
  onCancel: () => void;
}

export function TemplateForm({
  defaultValues,
  canChooseKind,
  cardChoices,
  tags,
  submitLabel,
  pending = false,
  onSubmit,
  onCancel,
}: TemplateFormProps) {
  const {
    register,
    handleSubmit,
    setFocus,
    control,
    formState: { errors },
  } = useForm<TemplateFormValues, unknown, TemplateCreate>({
    resolver: zodResolver(templateFormSchema),
    defaultValues,
  });
  const kind = useWatch({ control, name: "kind" });
  const { cards, isLoading, loadFailed, reload } = cardChoices;
  const hasNoCards = !isLoading && !loadFailed && cards.length === 0;
  const cardIsUnavailable = kind === "card_charge" && cards.length === 0;

  useEffect(() => setFocus("name"), [setFocus]);
  const { common, periods } = useMessages();
  const t = periods.templates;

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 pt-1">
      {canChooseKind ? (
        <SelectField
          label={t.kind}
          options={TEMPLATE_KINDS.map((value) => ({
            value,
            label: t.kinds[value],
          }))}
          {...register("kind")}
        />
      ) : null}
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
      {kind === "fixed" ? (
        <Field
          label={t.dueDay}
          hint={t.dueDayHint}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          className="font-mono"
          error={errors.dueDay?.message}
          {...register("dueDay")}
        />
      ) : null}
      {kind === "card_charge" ? (
        <div className="flex flex-col gap-2">
          <SelectField
            label={t.card}
            disabled={cards.length === 0}
            error={errors.cardId?.message}
            options={[
              { value: "", label: isLoading ? t.loadingCards : t.chooseCard },
              ...cards.map((card) => ({ value: card.id, label: card.name })),
            ]}
            {...register("cardId")}
          />
          {hasNoCards ? (
            <p className="text-sm text-muted-foreground">
              {t.noCardsBefore}
              <a href="#card-charges" className="text-foreground underline underline-offset-4">
                {t.noCardsLink}
              </a>
              {t.noCardsAfter}
            </p>
          ) : null}
          {loadFailed ? (
            <div className="flex items-center gap-3">
              <p className="text-sm text-muted-foreground">{t.cardsLoadFailed}</p>
              <Button variant="link" className="px-2" onClick={reload}>
                {common.tryAgain}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
      <SelectField
        label={common.tag}
        options={[
          { value: "", label: common.noTag },
          ...tags.map((tag) => ({ value: tag.id, label: tag.name })),
        ]}
        {...register("tagId")}
      />
      <div className="flex gap-2">
        <Button type="submit" className="flex-1" disabled={pending || cardIsUnavailable}>
          {pending ? common.saving : submitLabel}
        </Button>
        <Button variant="outline" className="flex-1" onClick={onCancel}>
          {common.cancel}
        </Button>
      </div>
    </form>
  );
}
