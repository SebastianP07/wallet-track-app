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
import { Button } from "@/shared/ui/button";
import { Field } from "@/shared/ui/field";
import { SelectField } from "@/shared/ui/select-field";

interface ExpenseFormProps {
  defaultValues: ExpenseFormValues;
  tags: Tag[];
  submitLabel: string;
  pending?: boolean;
  onSubmit: (draft: ExpenseDraft) => void;
  onCancel: () => void;
}

export function ExpenseForm({
  defaultValues,
  tags,
  submitLabel,
  pending = false,
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
      <Field
        label="Due date"
        type="date"
        className="font-mono"
        error={errors.dueDate?.message}
        {...register("dueDate")}
      />
      <SelectField
        label="Tag"
        options={[
          { value: "", label: "No tag" },
          ...tags.map((tag) => ({ value: tag.id, label: tag.name })),
        ]}
        {...register("tagId")}
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
