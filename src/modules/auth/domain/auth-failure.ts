import type { Messages } from "@/shared/i18n/messages";

export type AuthOperation =
  | "password"
  | "passkey"
  | "totp"
  | "recovery-code"
  | "enrollment-secret"
  | "enrollment-confirm"
  | "logout";

export function formatWait(seconds: number, messages: Messages): string {
  const t = messages.common;
  if (seconds < 60) {
    return t.seconds(seconds);
  }
  if (seconds < 3600) {
    return t.minutes(Math.ceil(seconds / 60));
  }
  return t.hours(Math.ceil(seconds / 3600));
}

export function describeTooMany(retryAfterSeconds: number | null, messages: Messages): string {
  return retryAfterSeconds === null
    ? messages.common.tooManyAttempts
    : messages.common.tooManyAttemptsWait(formatWait(retryAfterSeconds, messages));
}

export function describeAuthFailure(
  operation: AuthOperation,
  status: number,
  retryAfterSeconds: number | null,
  messages: Messages,
): string {
  switch (status) {
    case 400:
      return messages.common.checkInput;
    case 401:
      return messages.auth.failures.rejected[operation];
    case 403:
      return messages.common.unverified;
    case 409:
      return messages.auth.failures.alreadyEnrolled;
    case 429:
      return describeTooMany(retryAfterSeconds, messages);
    default:
      return messages.common.unreachableShort;
  }
}
