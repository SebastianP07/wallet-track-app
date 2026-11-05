export type PasskeyCeremonyFailure = "cancelled" | "already-registered" | "unsupported" | "failed";

export class PasskeyCeremonyError extends Error {
  constructor(readonly kind: PasskeyCeremonyFailure) {
    super(`Passkey ceremony ended: ${kind}`);
    this.name = "PasskeyCeremonyError";
  }
}

export const PASSKEYS_UNSUPPORTED = "This browser can't use passkeys, so enter a code instead.";
export const NO_PASSKEY_LEFT = "This account has no passkey anymore, so enter a code instead.";

export function describeCeremonyFailure(kind: PasskeyCeremonyFailure): string {
  switch (kind) {
    case "cancelled":
      return "The passkey prompt was cancelled or timed out. Try again, or use a code instead.";
    case "already-registered":
      return "This device already holds a passkey for Wallet Track.";
    case "unsupported":
      return PASSKEYS_UNSUPPORTED;
    case "failed":
      return "The passkey could not be used on this device. Try again, or use a code instead.";
  }
}

export function describeRegistrationCeremonyFailure(kind: PasskeyCeremonyFailure): string {
  switch (kind) {
    case "cancelled":
      return "The passkey prompt was cancelled or timed out, so nothing was added. That code is spent: enter a new one to try again.";
    case "already-registered":
      return "This device already holds a passkey for Wallet Track, so nothing was added. That code is spent.";
    case "unsupported":
      return "This browser can't create passkeys, so nothing was added. That code is spent.";
    case "failed":
      return "The passkey could not be created on this device, so nothing was added. That code is spent: enter a new one to try again.";
  }
}
