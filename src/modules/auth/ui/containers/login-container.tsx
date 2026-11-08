"use client";

import { useCallback } from "react";

import { useLoginFlow } from "../../application/use-login-flow";
import {
  enrollmentSecretSchema,
  recoveryCodeSchema,
  totpCodeSchema,
} from "../../domain/credentials";
import { browserPasskeys } from "../../infrastructure/browser-passkeys";
import { httpAuthRepository } from "../../infrastructure/http-auth-repository";
import { EnrollmentQr } from "../components/enrollment-qr";
import { LoginLayout } from "../components/login-layout";
import { PasskeyStep } from "../components/passkey-step";
import { PasswordForm } from "../components/password-form";
import { RecoveryCodesDisplay } from "../components/recovery-codes-display";
import { CODE_INPUT_PROPS, SingleFieldForm } from "../components/single-field-form";
import { useMessages } from "@/shared/i18n/use-i18n";
import { Button } from "@/shared/ui/button";

export function LoginContainer() {
  const goToDashboard = useCallback(() => window.location.replace("/"), []);
  const { stage, failure, isPending, passkeyAvailable, submit, goTo, clearFailure } = useLoginFlow(
    httpAuthRepository,
    browserPasskeys,
    goToDashboard,
  );
  const t = useMessages().auth;
  const copy = t.stages[stage.name];

  const startOver = (
    <Button variant="link" className="px-0" onClick={() => goTo({ name: "password" })}>
      {t.startOver}
    </Button>
  );

  const usePasskeyInstead = passkeyAvailable ? (
    <Button variant="link" className="px-0" onClick={() => goTo({ name: "passkey" })}>
      {t.usePasskey}
    </Button>
  ) : null;

  return (
    <LoginLayout eyebrow={copy.eyebrow} title={copy.title} description={copy.description || undefined}>
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
            {t.useAuthenticator}
          </Button>
          <Button variant="link" className="px-0" onClick={() => goTo({ name: "recovery-code" })}>
            {t.useRecoveryCode}
          </Button>
          {startOver}
        </PasskeyStep>
      ) : null}

      {stage.name === "totp" ? (
        <SingleFieldForm
          key="totp"
          schema={totpCodeSchema}
          label={t.authenticationCode}
          submitLabel={t.verify}
          inputProps={CODE_INPUT_PROPS}
          failure={failure}
          pending={isPending}
          onInvalid={clearFailure}
          onSubmit={(value) => submit({ operation: "totp", value })}
        >
          {usePasskeyInstead}
          <Button variant="link" className="px-0" onClick={() => goTo({ name: "recovery-code" })}>
            {t.useRecoveryCode}
          </Button>
          {startOver}
        </SingleFieldForm>
      ) : null}

      {stage.name === "recovery-code" ? (
        <SingleFieldForm
          key="recovery-code"
          schema={recoveryCodeSchema}
          label={t.recoveryCode}
          submitLabel={t.verify}
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
            {t.useAuthenticator}
          </Button>
          {startOver}
        </SingleFieldForm>
      ) : null}

      {stage.name === "enrollment-secret" ? (
        <SingleFieldForm
          key="enrollment-secret"
          schema={enrollmentSecretSchema}
          label={t.enrollmentSecret}
          submitLabel={t.continue}
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
            label={t.codeFromApp}
            submitLabel={t.confirm}
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
