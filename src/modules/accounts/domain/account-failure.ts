export function describeAccountFailure(status: number): string {
  switch (status) {
    case 400:
      return "That change was not accepted. Check the name and the amount; amounts and totals have a limit.";
    case 403:
      return "This request could not be verified. Reload the page and try again.";
    case 404:
      return "That account no longer exists.";
    default:
      return "Wallet Track can't reach its server right now, so nothing was changed. Try again in a moment.";
  }
}
