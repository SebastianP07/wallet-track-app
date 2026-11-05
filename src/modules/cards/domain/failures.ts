export function describeCardFailure(status: number): string {
  switch (status) {
    case 400:
      return "That card was not accepted. Check its name, issuer and days.";
    case 403:
      return "This request could not be verified. Reload the page and try again.";
    case 404:
      return "That card no longer exists.";
    default:
      return "Wallet Track can't reach its server right now, so nothing was changed. Try again in a moment.";
  }
}
