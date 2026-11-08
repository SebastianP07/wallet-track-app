"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  incomeFormSchema,
  type IncomeDraft,
  type IncomeFormValues,
} from "../../domain/income-forms";
import type { Tag } from "@/modules/tags/domain/types";
import { useMessages } from "@/shared/i18n/use-i18n";
import { Button } from "@/shared/ui/button";
import { CheckboxField } from "@/shared/ui/checkbox-field";
import { Field } from "@/shared/ui/field";
import { SelectField } from "@/shared/ui/select-field";

interface IncomeFormProps {
  defaultValues: IncomeFormValues;
  tags: Tag[];
  submitLabel: string;
  pending?: boolean;
  // Only a form that adds an item offers this, with what repeating means there.
  repeatHint?: string;
  onSubmit: (draft: IncomeDraft) => void;
  onCancel: () => void;
}

export function IncomeForm({
  defaultValues,
  tags,
  submitLabel,
  pending = false,
  repeatHint,
  onSubmit,
  onCancel,
}: IncomeFormProps) {
  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors },
  } = useForm<IncomeFormValues, unknown, IncomeDraft>({
    resolver: zodResolver(incomeFormSchema),
    defaultValues,
  });

  useEffect(() => setFocus("name"), [setFocus]);
  const { common, expenses } = useMessages();

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
      <SelectField
        label={common.tag}
        options={[
          { value: "", label: common.noTag },
          ...tags.map((tag) => ({ value: tag.id, label: tag.name })),
        ]}
        {...register("tagId")}
      />
      {repeatHint ? (
        <CheckboxField label={expenses.repeatMonthly} hint={repeatHint} {...register("repeatsMonthly")} />
      ) : null}
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
