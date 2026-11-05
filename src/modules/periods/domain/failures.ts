const FORBIDDEN = "This request could not be verified. Reload the page and try again.";
const UNREACHABLE =
  "Wallet Track can't reach its server right now, so nothing was changed. Try again in a moment.";

export function describePeriodFailure(status: number): string {
  switch (status) {
    case 400:
      return "That month can't be used. Months start at January 2000.";
    case 403:
      return FORBIDDEN;
    case 404:
      return "This month has not been opened. Reload the page to see it as it is now.";
    default:
      return UNREACHABLE;
  }
}

export function describeTemplateFailure(status: number): string {
  switch (status) {
    case 400:
      return "That change was not accepted. Check the values; an active card charge must keep a card.";
    case 403:
      return FORBIDDEN;
    case 404:
      return "That template no longer exists.";
    default:
      return UNREACHABLE;
  }
}
