import { formatWait } from "./auth-failure";

const dateTime = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Bogota",
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatDateTime(timestamp: string): string {
  return dateTime.format(new Date(timestamp));
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

export function describeDevice(userAgent: string | null): string {
  if (!userAgent) {
    return "Unknown device";
  }
  const browser = firstMatch(BROWSERS, userAgent);
  const system = firstMatch(SYSTEMS, userAgent);
  if (browser && system) {
    return `${browser} on ${system}`;
  }
  return browser ?? system ?? "Unknown device";
}

const UNREACHABLE = "Wallet Track can't reach its server right now, so nothing was changed. Try again in a moment.";
const UNVERIFIED = "This request could not be verified. Reload the page and try again.";

function tooMany(retryAfterSeconds: number | null): string {
  return retryAfterSeconds === null
    ? "Too many attempts. Try again later."
    : `Too many attempts. Try again in ${formatWait(retryAfterSeconds)}.`;
}

// A 401 here means the session is still good: the hook checks that before calling this.
export function describeProofFailure(status: number, retryAfterSeconds: number | null): string {
  switch (status) {
    case 400:
      return "Check what you entered and try again.";
    case 401:
      return "That code was not accepted. A code works once, so wait for the next one or use another.";
    case 403:
      return UNVERIFIED;
    case 404:
      return "That passkey no longer exists.";
    case 429:
      return tooMany(retryAfterSeconds);
    default:
      return UNREACHABLE;
  }
}

export function describeRegistrationFailure(status: number, retryAfterSeconds: number | null): string {
  switch (status) {
    case 401:
      return "The passkey was not accepted, or this took too long. Nothing was added. Enter a new code to try again.";
    case 409:
      return "That passkey is already registered.";
    default:
      return describeProofFailure(status, retryAfterSeconds);
  }
}

export function describeRenameFailure(status: number): string {
  switch (status) {
    case 400:
      return "That name was not accepted.";
    case 403:
      return UNVERIFIED;
    case 404:
      return "That passkey no longer exists.";
    default:
      return UNREACHABLE;
  }
}

export function describeRevokeFailure(status: number): string {
  switch (status) {
    case 403:
      return UNVERIFIED;
    case 404:
      return "That session has already ended.";
    default:
      return UNREACHABLE;
  }
}
