export type PasskeyCeremonyFailure = "cancelled" | "already-registered" | "unsupported" | "failed";

// Each kind is worded in the messages: auth.failures.ceremony when signing in, and
// security.failures.registrationCeremony when adding a passkey.
export class PasskeyCeremonyError extends Error {
  constructor(readonly kind: PasskeyCeremonyFailure) {
    super(`Passkey ceremony ended: ${kind}`);
    this.name = "PasskeyCeremonyError";
  }
}
