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
import { Button } from "@/shared/ui/button";
import { Field } from "@/shared/ui/field";
import { SelectField } from "@/shared/ui/select-field";

interface IncomeFormProps {
  defaultValues: IncomeFormValues;
  tags: Tag[];
  submitLabel: string;
  pending?: boolean;
  onSubmit: (draft: IncomeDraft) => void;
  onCancel: () => void;
}

export function IncomeForm({
  defaultValues,
  tags,
  submitLabel,
  pending = false,
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
