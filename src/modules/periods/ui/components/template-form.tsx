"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import {
  templateFormSchema,
  type TemplateFormValues,
} from "../../domain/template-forms";
import { TEMPLATE_KIND_LABELS, TEMPLATE_KINDS } from "../../domain/template-groups";
import type { CreditCard, TemplateCreate } from "../../domain/types";
import type { Tag } from "@/modules/tags/domain/types";
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

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 pt-1">
      {canChooseKind ? (
        <SelectField
          label="Kind"
          options={TEMPLATE_KINDS.map((value) => ({
            value,
            label: TEMPLATE_KIND_LABELS[value],
          }))}
          {...register("kind")}
        />
      ) : null}
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
      {kind === "fixed" ? (
        <Field
          label="Due day"
          hint="1 to 31. In a shorter month it falls on the last day."
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
            label="Card"
            disabled={cards.length === 0}
            error={errors.cardId?.message}
            options={[
              { value: "", label: isLoading ? "Loading cards…" : "Choose a card" },
              ...cards.map((card) => ({ value: card.id, label: card.name })),
            ]}
            {...register("cardId")}
          />
          {hasNoCards ? (
            <p className="text-sm text-muted-foreground">
              There are no credit cards yet, and a card charge needs one. Managing cards is not
              available yet, so this can&apos;t be saved for now.
            </p>
          ) : null}
          {loadFailed ? (
            <div className="flex items-center gap-3">
              <p className="text-sm text-muted-foreground">The cards could not be loaded.</p>
              <Button variant="link" className="px-2" onClick={reload}>
                Try again
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
      <SelectField
        label="Tag"
        options={[
          { value: "", label: "No tag" },
          ...tags.map((tag) => ({ value: tag.id, label: tag.name })),
        ]}
        {...register("tagId")}
      />
      <div className="flex gap-2">
        <Button type="submit" className="flex-1" disabled={pending || cardIsUnavailable}>
          {pending ? "Saving…" : submitLabel}
        </Button>
        <Button variant="outline" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
