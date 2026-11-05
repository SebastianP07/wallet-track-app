export function describeExpenseFailure(status: number): string {
  switch (status) {
    case 400:
      return "That change was not accepted. Check the values; amounts and the month's totals have a limit.";
    case 403:
      return "This request could not be verified. Reload the page and try again.";
    case 404:
      return "That item no longer exists. Reload the page to see the month as it is now.";
    case 409:
      return "This month is closed, so it takes no new items.";
    default:
      return "Wallet Track can't reach its server right now, so nothing was changed. Try again in a moment.";
  }
}
