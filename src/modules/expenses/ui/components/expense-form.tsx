"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  expenseFormSchema,
  type ExpenseDraft,
  type ExpenseFormValues,
} from "../../domain/expense-forms";
import type { Tag } from "@/modules/tags/domain/types";
import { useMessages } from "@/shared/i18n/use-i18n";
import { Button } from "@/shared/ui/button";
import { CheckboxField } from "@/shared/ui/checkbox-field";
import { Field } from "@/shared/ui/field";
import { SelectField } from "@/shared/ui/select-field";

interface ExpenseFormProps {
  defaultValues: ExpenseFormValues;
  tags: Tag[];
  submitLabel: string;
  pending?: boolean;
  // Only a form that adds an item offers this, with what repeating means there.
  repeatHint?: string;
  onSubmit: (draft: ExpenseDraft) => void;
  onCancel: () => void;
}

export function ExpenseForm({
  defaultValues,
  tags,
  submitLabel,
  pending = false,
  repeatHint,
  onSubmit,
  onCancel,
}: ExpenseFormProps) {
  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors },
  } = useForm<ExpenseFormValues, unknown, ExpenseDraft>({
    resolver: zodResolver(expenseFormSchema),
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
      <Field
        label={expenses.dueDate}
        type="date"
        className="font-mono"
        error={errors.dueDate?.message}
        {...register("dueDate")}
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
