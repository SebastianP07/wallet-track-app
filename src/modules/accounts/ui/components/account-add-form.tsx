"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { newAccountSchema } from "../../domain/account-forms";
import { KIND_LABELS, kindsOf, type AccountGroup } from "../../domain/account-groups";
import { flipCopInputSign } from "../../domain/money";
import type { AccountCreate } from "../../domain/types";
import { MoneyField } from "./money-field";
import { Button } from "@/shared/ui/button";
import { Field } from "@/shared/ui/field";
import { SelectField } from "@/shared/ui/select-field";

interface AccountAddFormProps {
  group: AccountGroup;
  pending: boolean;
  onSubmit: (account: AccountCreate) => void;
  onCancel: () => void;
}

export function AccountAddForm({ group, pending, onSubmit, onCancel }: AccountAddFormProps) {
  const kinds = kindsOf(group);
  const {
    register,
    handleSubmit,
    setFocus,
    getValues,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(newAccountSchema),
    defaultValues: { name: "", kind: kinds[0], balance: "" },
  });

  useEffect(() => setFocus("name"), [setFocus]);

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="mt-auto flex flex-col gap-3 border-t border-rule pt-3"
    >
      <Field label="Name" autoComplete="off" error={errors.name?.message} {...register("name")} />
      {kinds.length > 1 ? (
        <SelectField
          label="Kind"
          options={kinds.map((kind) => ({ value: kind, label: KIND_LABELS[kind] }))}
          {...register("kind")}
        />
      ) : null}
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
