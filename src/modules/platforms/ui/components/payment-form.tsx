"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  paymentFormSchema,
  type PaymentDraft,
  type PaymentFormValues,
} from "../../domain/platform-forms";
import { Button } from "@/shared/ui/button";
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
    handleSubmit,
    setFocus,
    formState: { errors },
  } = useForm<PaymentFormValues, unknown, PaymentDraft>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues,
  });

  useEffect(() => setFocus("paidAt"), [setFocus]);

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 pt-1">
      <Field
        label="Paid on"
        hint="Coverage counts from this date's month, and doesn't add to any earlier coverage."
        type="date"
        error={errors.paidAt?.message}
        {...register("paidAt")}
      />
      <Field
        label="Months covered"
        type="text"
        inputMode="numeric"
        autoComplete="off"
        className="font-mono"
        error={errors.monthsCovered?.message}
        {...register("monthsCovered")}
      />
      <div className="flex gap-2">
        <Button type="submit" className="flex-1" disabled={pending} aria-label={`Confirm payment from ${name}`}>
          {pending ? "Saving…" : "Confirm"}
        </Button>
        <Button variant="outline" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
