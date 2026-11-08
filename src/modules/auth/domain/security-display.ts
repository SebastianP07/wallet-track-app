import { describeTooMany } from "./auth-failure";
import { languageTag, type Locale } from "@/shared/i18n/locale";
import type { Messages } from "@/shared/i18n/messages";

export function formatDateTime(timestamp: string, locale: Locale): string {
  return new Intl.DateTimeFormat(languageTag(locale), {
    timeZone: "America/Bogota",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

const BROWSERS: readonly [RegExp, string][] = [
  [/Edg(e|A|iOS)?\//, "Edge"],
  [/OPR\//, "Opera"],
  [/(Firefox|FxiOS)\//, "Firefox"],
  [/(Chrome|CriOS)\//, "Chrome"],
  [/Safari\//, "Safari"],
];

const SYSTEMS: readonly [RegExp, string][] = [
  [/Android/, "Android"],
  [/(iPhone|iPad)/, "iOS"],
  [/Mac OS X/, "macOS"],
  [/Windows/, "Windows"],
  [/CrOS/, "ChromeOS"],
  [/Linux/, "Linux"],
];

const firstMatch = (table: readonly [RegExp, string][], userAgent: string) =>
  table.find(([pattern]) => pattern.test(userAgent))?.[1];

export function describeDevice(userAgent: string | null, messages: Messages): string {
  const t = messages.security;
  if (!userAgent) {
    return t.unknownDevice;
  }
  const browser = firstMatch(BROWSERS, userAgent);
  const system = firstMatch(SYSTEMS, userAgent);
  if (browser && system) {
    return t.browserOn(browser, system);
  }
  return browser ?? system ?? t.unknownDevice;
}

// A 401 here means the session is still good: the hook checks that before calling this.
export function describeProofFailure(status: number, retryAfterSeconds: number | null, messages: Messages): string {
  switch (status) {
    case 400:
      return messages.common.checkInput;
    case 401:
      return messages.security.failures.codeRejected;
    case 403:
      return messages.common.unverified;
    case 404:
      return messages.security.failures.passkeyGone;
    case 429:
      return describeTooMany(retryAfterSeconds, messages);
    default:
      return messages.common.unreachable;
  }
}

export function describeRegistrationFailure(
  status: number,
  retryAfterSeconds: number | null,
  messages: Messages,
): string {
  switch (status) {
    case 401:
      return messages.security.failures.registrationRejected;
    case 409:
      return messages.security.failures.alreadyRegistered;
    default:
      return describeProofFailure(status, retryAfterSeconds, messages);
  }
}

export function describeRenameFailure(status: number, messages: Messages): string {
  switch (status) {
    case 400:
      return messages.security.failures.nameRejected;
    case 403:
      return messages.common.unverified;
    case 404:
      return messages.security.failures.passkeyGone;
    default:
      return messages.common.unreachable;
  }
}

export function describeRevokeFailure(status: number, messages: Messages): string {
  switch (status) {
    case 403:
      return messages.common.unverified;
    case 404:
      return messages.security.failures.sessionGone;
    default:
      return messages.common.unreachable;
  }
}
