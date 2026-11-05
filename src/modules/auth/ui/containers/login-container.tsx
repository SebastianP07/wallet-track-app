"use client";

import { useCallback } from "react";

import { useLoginFlow } from "../../application/use-login-flow";
import {
  enrollmentSecretSchema,
  recoveryCodeSchema,
  totpCodeSchema,
} from "../../domain/credentials";
import type { LoginStage } from "../../domain/login-flow";
import { browserPasskeys } from "../../infrastructure/browser-passkeys";
import { httpAuthRepository } from "../../infrastructure/http-auth-repository";
import { EnrollmentQr } from "../components/enrollment-qr";
import { LoginLayout } from "../components/login-layout";
import { PasskeyStep } from "../components/passkey-step";
import { PasswordForm } from "../components/password-form";
import { RecoveryCodesDisplay } from "../components/recovery-codes-display";
import { CODE_INPUT_PROPS, SingleFieldForm } from "../components/single-field-form";
import { Button } from "@/shared/ui/button";

const STAGE_COPY: Record<LoginStage["name"], { eyebrow: string; title: string; description?: string }> = {
  password: { eyebrow: "Sign in", title: "Welcome back" },
  passkey: {
    eyebrow: "Second factor",
    title: "Use your passkey",
    description: "Confirm with your device's screen lock or your security key.",
  },
  totp: {
    eyebrow: "Second factor",
    title: "Enter your code",
    description: "Open your authenticator app for the current 6-digit code.",
  },
  "recovery-code": {
    eyebrow: "Second factor",
    title: "Use a recovery code",
    description: "Each recovery code works once.",
  },
  "enrollment-secret": {
    eyebrow: "First sign-in · 1 of 3",
    title: "Set up two-factor",
    description: "Enter the one-time enrollment secret that create-owner printed.",
  },
  "enrollment-confirm": {
    eyebrow: "First sign-in · 2 of 3",
    title: "Add your authenticator",
  },
  "recovery-codes": {
    eyebrow: "First sign-in · 3 of 3",
    title: "You're set up",
  },
};

export function LoginContainer() {
  const goToDashboard = useCallback(() => window.location.replace("/"), []);
  const { stage, failure, isPending, passkeyAvailable, submit, goTo, clearFailure } = useLoginFlow(
    httpAuthRepository,
    browserPasskeys,
    goToDashboard,
  );
  const copy = STAGE_COPY[stage.name];

  const startOver = (
    <Button variant="link" className="px-0" onClick={() => goTo({ name: "password" })}>
      Start over
    </Button>
  );

  const usePasskeyInstead = passkeyAvailable ? (
    <Button variant="link" className="px-0" onClick={() => goTo({ name: "passkey" })}>
      Use your passkey
    </Button>
  ) : null;

  return (
    <LoginLayout eyebrow={copy.eyebrow} title={copy.title} description={copy.description}>
      {stage.name === "password" ? (
        <PasswordForm
          failure={failure}
          pending={isPending}
          onInvalid={clearFailure}
          onSubmit={(credentials) => submit({ operation: "password", credentials })}
        />
      ) : null}

      {stage.name === "passkey" ? (
        <PasskeyStep
          failure={failure}
          pending={isPending}
          onStart={() => submit({ operation: "passkey" })}
        >
          <Button variant="link" className="px-0" onClick={() => goTo({ name: "totp" })}>
            Use your authenticator
          </Button>
          <Button variant="link" className="px-0" onClick={() => goTo({ name: "recovery-code" })}>
            Use a recovery code
          </Button>
          {startOver}
        </PasskeyStep>
      ) : null}

      {stage.name === "totp" ? (
        <SingleFieldForm
          key="totp"
          schema={totpCodeSchema}
          label="Authentication code"
          submitLabel="Verify"
          inputProps={CODE_INPUT_PROPS}
          failure={failure}
          pending={isPending}
          onInvalid={clearFailure}
          onSubmit={(value) => submit({ operation: "totp", value })}
        >
          {usePasskeyInstead}
          <Button variant="link" className="px-0" onClick={() => goTo({ name: "recovery-code" })}>
            Use a recovery code
          </Button>
          {startOver}
        </SingleFieldForm>
      ) : null}

      {stage.name === "recovery-code" ? (
        <SingleFieldForm
          key="recovery-code"
          schema={recoveryCodeSchema}
          label="Recovery code"
          submitLabel="Verify"
          inputProps={{
            type: "text",
            autoComplete: "off",
            autoCapitalize: "characters",
            spellCheck: false,
            className: "font-mono",
          }}
          failure={failure}
          pending={isPending}
          onInvalid={clearFailure}
          onSubmit={(value) => submit({ operation: "recovery-code", value })}
        >
          {usePasskeyInstead}
          <Button variant="link" className="px-0" onClick={() => goTo({ name: "totp" })}>
            Use your authenticator
          </Button>
          {startOver}
        </SingleFieldForm>
      ) : null}

      {stage.name === "enrollment-secret" ? (
        <SingleFieldForm
          key="enrollment-secret"
          schema={enrollmentSecretSchema}
          label="Enrollment secret"
          submitLabel="Continue"
          inputProps={{
            type: "password",
            autoComplete: "off",
            autoCapitalize: "none",
            spellCheck: false,
          }}
          failure={failure}
          pending={isPending}
          onInvalid={clearFailure}
          onSubmit={(value) => submit({ operation: "enrollment-secret", value })}
        >
          {startOver}
        </SingleFieldForm>
      ) : null}

      {stage.name === "enrollment-confirm" ? (
        <div className="flex flex-col gap-6">
          <EnrollmentQr enrollment={stage.enrollment} />
          <SingleFieldForm
            key="enrollment-confirm"
            schema={totpCodeSchema}
            label="Code from your app"
            submitLabel="Confirm"
            inputProps={CODE_INPUT_PROPS}
            failure={failure}
            pending={isPending}
            onInvalid={clearFailure}
            onSubmit={(value) => submit({ operation: "enrollment-confirm", value })}
          >
            {startOver}
          </SingleFieldForm>
        </div>
      ) : null}

      {stage.name === "recovery-codes" ? (
        <RecoveryCodesDisplay codes={stage.codes} onContinue={goToDashboard} />
      ) : null}
    </LoginLayout>
  );
}
