"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { accountBalanceSchema } from "@/modules/accounts/domain/account-forms";
import { flipCopInputSign, formatCopInput } from "@/modules/accounts/domain/money";
import { MoneyField } from "@/modules/accounts/ui/components/money-field";
import { useMessages } from "@/shared/i18n/use-i18n";
import { Button } from "@/shared/ui/button";

interface OpeningBalanceFormProps {
  // Null when the month has none yet: the field starts empty and there is nothing to clear.
  openingBalance: number | null;
  onSubmit: (openingBalance: number | null) => void;
  onCancel: () => void;
}

// The same whole-pesos field as an account's balance, which the opening balance is a snapshot of.
export function OpeningBalanceForm({ openingBalance, onSubmit, onCancel }: OpeningBalanceFormProps) {
  const {
    register,
    handleSubmit,
    setFocus,
    getValues,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(accountBalanceSchema),
    defaultValues: { balance: openingBalance === null ? "" : formatCopInput(openingBalance) },
  });

  useEffect(() => setFocus("balance", { shouldSelect: true }), [setFocus]);
  const { common, dashboard } = useMessages();
  const t = dashboard.kpis;

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) => onSubmit(values.balance))}
      className="flex flex-col gap-2 pt-1"
    >
      <MoneyField
        label={t.openingBalanceInPesos}
        error={errors.balance?.message}
        onFlipSign={() => setValue("balance", flipCopInputSign(getValues("balance")))}
        {...register("balance")}
      />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" className="flex-1">
          {t.saveOpeningBalance}
        </Button>
        {openingBalance === null ? null : (
          <Button variant="outline" className="flex-1" onClick={() => onSubmit(null)}>
            {t.clearOpeningBalance}
          </Button>
        )}
        <Button variant="outline" className="flex-1" onClick={onCancel}>
          {common.cancel}
        </Button>
      </div>
    </form>
  );
}
