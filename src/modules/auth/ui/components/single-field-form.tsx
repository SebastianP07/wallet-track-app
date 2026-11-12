"use client";

import { useEffect, type ComponentProps, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import type { LoginFailure } from "../../application/use-login-flow";
import { useMessages } from "@/shared/i18n/use-i18n";
import { Button } from "@/shared/ui/button";
import { Field } from "@/shared/ui/field";
import { FormAlert } from "@/shared/ui/form-alert";

interface SingleFieldValues {
  value: string;
}

interface SingleFieldFormProps {
  schema: z.ZodType<SingleFieldValues, SingleFieldValues>;
  label: string;
  hint?: ReactNode;
  submitLabel: string;
  inputProps: ComponentProps<"input">;
  failure: LoginFailure | null;
  pending: boolean;
  onSubmit: (value: string) => void;
  onInvalid: () => void;
  children?: ReactNode;
}

export function SingleFieldForm({
  schema,
  label,
  hint,
  submitLabel,
  inputProps,
  failure,
  pending,
  onSubmit,
  onInvalid,
  children,
}: SingleFieldFormProps) {
  const {
    register,
    handleSubmit,
    resetField,
    setFocus,
    formState: { errors },
  } = useForm<SingleFieldValues>({
    resolver: zodResolver(schema),
    defaultValues: { value: "" },
  });

  useEffect(() => setFocus("value"), [setFocus]);
  const t = useMessages().auth;

  useEffect(() => {
    if (failure) {
      resetField("value");
      setFocus("value");
    }
  }, [failure, resetField, setFocus]);

  return (
    <form
      method="post"
      onSubmit={handleSubmit(({ value }) => onSubmit(value), onInvalid)}
      noValidate
      className="flex flex-col gap-5"
    >
      <FormAlert message={failure?.message} />
      <Field
        label={label}
        hint={hint}
        error={errors.value?.message}
        {...inputProps}
        {...register("value")}
      />
      <Button type="submit" disabled={pending}>
        {pending ? t.checking : submitLabel}
      </Button>
      {children ? <div className="flex flex-wrap items-center gap-x-5">{children}</div> : null}
    </form>
  );
}

export const CODE_INPUT_PROPS: ComponentProps<"input"> = {
  type: "text",
  inputMode: "numeric",
  autoComplete: "one-time-code",
  maxLength: 6,
  className: "font-mono tracking-[0.3em] text-lg",
};
