"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  paymentFormSchema,
  type PaymentDraft,
  type PaymentFormValues,
} from "../../domain/platform-forms";
import { useMessages } from "@/shared/i18n/use-i18n";
import { Button } from "@/shared/ui/button";
import { DateField } from "@/shared/ui/date-field";
import { Field } from "@/shared/ui/field";

interface PaymentFormProps {
  name: string;
  defaultValues: PaymentFormValues;
  pending: boolean;
  onSubmit: (payment: PaymentDraft) => void;
  onCancel: () => void;
}

export function PaymentForm({ name, defaultValues, pending, onSubmit, onCancel }: PaymentFormProps) {
  const {
    register,
    control,
    handleSubmit,
    setFocus,
    formState: { errors },
  } = useForm<PaymentFormValues, unknown, PaymentDraft>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues,
  });

  useEffect(() => setFocus("paidAt"), [setFocus]);
  const { common, platforms: t } = useMessages();

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 pt-1">
      <DateField
        control={control}
        name="paidAt"
        label={t.paidOn}
        hint={t.paidOnHint}
        error={errors.paidAt?.message}
      />
      <Field
        label={t.monthsCovered}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        className="font-mono"
        error={errors.monthsCovered?.message}
        {...register("monthsCovered")}
      />
      <div className="flex gap-2">
        <Button type="submit" className="flex-1" disabled={pending} aria-label={t.confirmPaymentFrom(name)}>
          {pending ? common.saving : t.confirm}
        </Button>
        <Button variant="outline" className="flex-1" onClick={onCancel}>
          {common.cancel}
        </Button>
      </div>
    </form>
  );
}
