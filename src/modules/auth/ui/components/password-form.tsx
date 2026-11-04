"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import type { LoginFailure } from "../../application/use-login-flow";
import type { PasswordLoginRequest } from "../../domain/types";
import { passwordLoginSchema } from "../../domain/credentials";
import { Button } from "@/shared/ui/button";
import { Field } from "@/shared/ui/field";
import { FormAlert } from "@/shared/ui/form-alert";

interface PasswordFormProps {
  failure: LoginFailure | null;
  pending: boolean;
  onSubmit: (credentials: PasswordLoginRequest) => void;
  onInvalid: () => void;
}

export function PasswordForm({ failure, pending, onSubmit, onInvalid }: PasswordFormProps) {
  const {
    register,
    handleSubmit,
    resetField,
    setFocus,
    formState: { errors },
  } = useForm<PasswordLoginRequest>({
    resolver: zodResolver(passwordLoginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => setFocus("email"), [setFocus]);

  useEffect(() => {
    if (failure) {
      resetField("password");
      setFocus("password");
    }
  }, [failure, resetField, setFocus]);

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate className="flex flex-col gap-5">
      <FormAlert message={failure?.message} />
      <Field
        label="Email"
        type="email"
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        error={errors.email?.message}
        {...register("email")}
      />
      <Field
        label="Password"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
      />
      <Button type="submit" disabled={pending} className="mt-1">
        {pending ? "Checking…" : "Continue"}
      </Button>
    </form>
  );
}
