"use client";

import { useEffect, useId } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { tagFormSchema, type TagFormValues } from "../../domain/tag-forms";
import type { TagCreate } from "../../domain/types";
import { useMessages } from "@/shared/i18n/use-i18n";
import { fieldError } from "@/shared/i18n/validation-key";
import { Button } from "@/shared/ui/button";
import { Field } from "@/shared/ui/field";

interface TagFormProps {
  defaultValues: TagFormValues;
  submitLabel: string;
  pending: boolean;
  onSubmit: (tag: TagCreate) => void;
  onCancel: () => void;
}

export function TagForm({ defaultValues, submitLabel, pending, onSubmit, onCancel }: TagFormProps) {
  const colorId = useId();
  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors },
  } = useForm<TagFormValues, unknown, TagCreate>({
    resolver: zodResolver(tagFormSchema),
    defaultValues,
  });

  useEffect(() => setFocus("name"), [setFocus]);
  const messages = useMessages();
  const { common } = messages;

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 pt-1 md:max-w-md">
      <Field label={common.name} autoComplete="off" error={errors.name?.message} {...register("name")} />
      <div className="flex flex-col gap-2">
        <label htmlFor={colorId} className="text-sm font-medium">
          {messages.tags.color}
        </label>
        <input
          id={colorId}
          type="color"
          className="h-12 w-20 cursor-pointer rounded-md border border-input bg-card p-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50"
          {...register("color")}
        />
        {errors.color ? (
          <p role="alert" className="text-sm text-destructive">
            {fieldError(messages, errors.color.message)}
          </p>
        ) : null}
      </div>
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
