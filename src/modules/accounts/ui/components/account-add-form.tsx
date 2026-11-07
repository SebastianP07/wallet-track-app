"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { newAccountSchema } from "../../domain/account-forms";
import { flipCopInputSign } from "../../domain/money";
import type { AccountCreate } from "../../domain/types";
import { MoneyField } from "./money-field";
import { Button } from "@/shared/ui/button";
import { Field } from "@/shared/ui/field";

interface AccountAddFormProps {
  pending: boolean;
  onSubmit: (account: AccountCreate) => void;
  onCancel: () => void;
}

export function AccountAddForm({ pending, onSubmit, onCancel }: AccountAddFormProps) {
  const {
    register,
    handleSubmit,
    setFocus,
    getValues,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(newAccountSchema),
    defaultValues: { name: "", balance: "" },
  });

  useEffect(() => setFocus("name"), [setFocus]);

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="mt-auto flex flex-col gap-3 border-t border-rule pt-3 md:max-w-md"
    >
      <Field label="Name" autoComplete="off" error={errors.name?.message} {...register("name")} />
      <MoneyField
        label="Balance in pesos"
        placeholder="0"
        error={errors.balance?.message}
        onFlipSign={() => setValue("balance", flipCopInputSign(getValues("balance")))}
        {...register("balance")}
      />
      <div className="flex gap-2">
        <Button type="submit" className="flex-1" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
        <Button variant="outline" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
