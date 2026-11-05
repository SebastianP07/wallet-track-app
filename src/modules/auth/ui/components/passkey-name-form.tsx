"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { passkeyNameSchema, type PasskeyNameValues } from "../../domain/security-forms";
import { Button } from "@/shared/ui/button";
import { Field } from "@/shared/ui/field";

interface PasskeyNameFormProps {
  name: string;
  pending: boolean;
  onSubmit: (name: string) => void;
  onCancel: () => void;
}

export function PasskeyNameForm({ name, pending, onSubmit, onCancel }: PasskeyNameFormProps) {
  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors },
  } = useForm<PasskeyNameValues>({
    resolver: zodResolver(passkeyNameSchema),
    defaultValues: { name },
  });

  useEffect(() => setFocus("name"), [setFocus]);

  return (
    <form
      noValidate
      className="flex flex-col gap-3 pt-1 md:max-w-md"
      onSubmit={handleSubmit((values) => onSubmit(values.name))}
    >
      <Field label="Passkey name" autoComplete="off" error={errors.name?.message} {...register("name")} />
      <div className="flex gap-2">
        <Button type="submit" className="flex-1" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
        <Button variant="outline" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
