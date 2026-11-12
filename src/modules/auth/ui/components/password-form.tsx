"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";

import type { LoginFailure } from "../../application/use-login-flow";
import type { PasswordLoginRequest } from "../../domain/types";
import { passwordLoginSchema } from "../../domain/credentials";
import { useMessages } from "@/shared/i18n/use-i18n";
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

  const [passwordVisible, setPasswordVisible] = useState(false);
  useEffect(() => setFocus("email"), [setFocus]);
  const t = useMessages().auth;
  const toggleLabel = passwordVisible ? t.hidePassword : t.showPassword;

  useEffect(() => {
    if (failure) {
      resetField("password");
      setFocus("password");
    }
  }, [failure, resetField, setFocus]);

  return (
    <form
      method="post"
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      noValidate
      className="flex flex-col gap-5"
    >
      <FormAlert message={failure?.message} />
      <Field
        label={t.email}
        type="email"
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        error={errors.email?.message}
        {...register("email")}
      />
      <Field
        label={t.password}
        type={passwordVisible ? "text" : "password"}
        autoComplete="current-password"
        autoCapitalize="none"
        spellCheck={false}
        error={errors.password?.message}
        trailing={
          <Button
            variant="outline"
            className="shrink-0 px-3"
            aria-label={toggleLabel}
            aria-pressed={passwordVisible}
            title={toggleLabel}
            // Keeps focus on the password input when the toggle is clicked with a pointer.
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setPasswordVisible((visible) => !visible)}
          >
            {passwordVisible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
          </Button>
        }
        {...register("password")}
      />
      <Button type="submit" disabled={pending} className="mt-1">
        {pending ? t.checking : t.continue}
      </Button>
    </form>
  );
}
