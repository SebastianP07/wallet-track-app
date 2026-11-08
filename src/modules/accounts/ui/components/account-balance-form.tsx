"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { accountBalanceSchema } from "../../domain/account-forms";
import { flipCopInputSign, formatCopInput } from "../../domain/money";
import { MoneyField } from "./money-field";
import { useMessages } from "@/shared/i18n/use-i18n";
import { Button } from "@/shared/ui/button";

interface AccountBalanceFormProps {
  balance: number;
  onSubmit: (balance: number) => void;
  onCancel: () => void;
}

export function AccountBalanceForm({ balance, onSubmit, onCancel }: AccountBalanceFormProps) {
  const {
    register,
    handleSubmit,
    setFocus,
    getValues,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(accountBalanceSchema),
    defaultValues: { balance: formatCopInput(balance) },
  });

  useEffect(() => setFocus("balance", { shouldSelect: true }), [setFocus]);
  const { common, accounts } = useMessages();

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) => onSubmit(values.balance))}
      className="flex flex-col gap-2 pt-1"
    >
      <MoneyField
        label={accounts.newBalanceInPesos}
        error={errors.balance?.message}
        onFlipSign={() => setValue("balance", flipCopInputSign(getValues("balance")))}
        {...register("balance")}
      />
      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          {accounts.saveBalance}
        </Button>
        <Button variant="outline" className="flex-1" onClick={onCancel}>
          {common.cancel}
        </Button>
      </div>
    </form>
  );
}
