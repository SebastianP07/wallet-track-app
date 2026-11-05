export function describePlatformFailure(status: number, conflict?: string): string {
  switch (status) {
    case 400:
      return "That was not accepted. Check the values; amounts have a limit, and someone who owes nothing has nothing to pay.";
    case 403:
      return "This request could not be verified. Reload the page and try again.";
    case 404:
      return "That no longer exists. Reload the page to see things as they are now.";
    case 409:
      return conflict ?? "That conflicts with what is already saved.";
    default:
      return "Wallet Track can't reach its server right now, so nothing was changed. Try again in a moment.";
  }
}

export const OWNER_CONFLICT = "Another person is already the owner.";
export const PERSON_HAS_PAYMENTS =
  "This person has payments, which are kept as history, so they can't be deleted. Remove them from their platforms instead.";
