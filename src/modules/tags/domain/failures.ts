export function describeTagFailure(status: number): string {
  switch (status) {
    case 400:
      return "That tag was not accepted. Check its name and color.";
    case 403:
      return "This request could not be verified. Reload the page and try again.";
    case 404:
      return "That tag no longer exists.";
    case 409:
      return "Another tag already has that name.";
    default:
      return "Wallet Track can't reach its server right now, so nothing was changed. Try again in a moment.";
  }
}
