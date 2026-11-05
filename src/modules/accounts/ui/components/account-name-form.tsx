"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { accountNameSchema } from "../../domain/account-forms";
import { Button } from "@/shared/ui/button";
import { Field } from "@/shared/ui/field";

interface AccountNameFormProps {
  name: string;
  onSubmit: (name: string) => void;
  onCancel: () => void;
}

export function AccountNameForm({ name, onSubmit, onCancel }: AccountNameFormProps) {
  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(accountNameSchema),
    defaultValues: { name },
  });

  useEffect(() => setFocus("name", { shouldSelect: true }), [setFocus]);

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) => onSubmit(values.name))}
      className="flex flex-col gap-2 pt-1"
    >
      <Field label="New name" autoComplete="off" error={errors.name?.message} {...register("name")} />
      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          Save name
        </Button>
        <Button variant="outline" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
