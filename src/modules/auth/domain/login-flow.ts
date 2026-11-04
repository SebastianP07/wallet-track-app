import type { LoginStep, MfaEnrollment } from "./types";

export type LoginStage =
  | { name: "password" }
  | { name: "totp" }
  | { name: "recovery-code" }
  | { name: "enrollment-secret" }
  | { name: "enrollment-confirm"; enrollment: MfaEnrollment }
  | { name: "recovery-codes"; codes: string[] };

export function stageAfterPassword(nextStep: LoginStep): LoginStage {
  return nextStep === "enroll_mfa" ? { name: "enrollment-secret" } : { name: "totp" };
}
