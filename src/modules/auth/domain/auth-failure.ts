export type AuthOperation =
  | "password"
  | "totp"
  | "recovery-code"
  | "enrollment-secret"
  | "enrollment-confirm"
  | "logout";

const REJECTED: Record<AuthOperation, string> = {
  password: "That email and password were not accepted.",
  totp: "That code was not accepted. Try the next one, or start over if this has taken a while.",
  "recovery-code": "That recovery code was not accepted. Try another, or start over.",
  "enrollment-secret": "That enrollment secret was not accepted, or it has expired.",
  "enrollment-confirm": "That code was not accepted. Try the next one, or start over.",
  logout: "Your session has already ended.",
};

export function formatWait(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} ${seconds === 1 ? "second" : "seconds"}`;
  }
  if (seconds < 3600) {
    const minutes = Math.ceil(seconds / 60);
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
  }
  const hours = Math.ceil(seconds / 3600);
  return `${hours} ${hours === 1 ? "hour" : "hours"}`;
}

export function describeAuthFailure(
  operation: AuthOperation,
  status: number,
  retryAfterSeconds: number | null,
): string {
  switch (status) {
    case 400:
      return "Check what you entered and try again.";
    case 401:
      return REJECTED[operation];
    case 403:
      return "This request could not be verified. Reload the page and try again.";
    case 409:
      return "Two-factor authentication is already set up. Sign in again.";
    case 429:
      return retryAfterSeconds === null
        ? "Too many attempts. Try again later."
        : `Too many attempts. Try again in ${formatWait(retryAfterSeconds)}.`;
    default:
      return "Wallet Track can't reach its server right now. Try again in a moment.";
  }
}
