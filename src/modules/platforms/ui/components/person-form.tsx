"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  personFormSchema,
  type PersonDraft,
  type PersonFormValues,
} from "../../domain/platform-forms";
import { Button } from "@/shared/ui/button";
import { Field } from "@/shared/ui/field";

interface PersonFormProps {
  defaultValues: PersonFormValues;
  submitLabel: string;
  pending: boolean;
  onSubmit: (person: PersonDraft) => void;
  onCancel: () => void;
}

export function PersonForm({ defaultValues, submitLabel, pending, onSubmit, onCancel }: PersonFormProps) {
  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors },
  } = useForm<PersonFormValues, unknown, PersonDraft>({
    resolver: zodResolver(personFormSchema),
    defaultValues,
  });

  useEffect(() => setFocus("name"), [setFocus]);

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 pt-1">
      <Field label="Name" autoComplete="off" error={errors.name?.message} {...register("name")} />
      <Field
        label="Billed every (months)"
        hint="1 is monthly, 6 is semiannual."
        type="text"
        inputMode="numeric"
        autoComplete="off"
        className="font-mono"
        error={errors.billingMonths?.message}
        {...register("billingMonths")}
      />
      <label className="flex min-h-11 items-center gap-3 text-sm font-medium">
        <input type="checkbox" className="size-5 accent-primary" {...register("isOwner")} />
        This is the owner, who owes nothing but counts in the split
      </label>
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
