"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  personFormSchema,
  type PersonDraft,
  type PersonFormValues,
} from "../../domain/platform-forms";
import { useMessages } from "@/shared/i18n/use-i18n";
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
  const { common, platforms: t } = useMessages();

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 pt-1">
      <Field label={common.name} autoComplete="off" error={errors.name?.message} {...register("name")} />
      <Field
        label={t.billedEvery}
        hint={t.billedEveryHint}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        className="font-mono"
        error={errors.billingMonths?.message}
        {...register("billingMonths")}
      />
      <label className="flex min-h-11 items-center gap-3 text-sm font-medium">
        <input type="checkbox" className="size-5 accent-primary" {...register("isOwner")} />
        {t.isOwner}
      </label>
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
