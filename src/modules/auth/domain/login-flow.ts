import type { LoginStep, MfaEnrollment } from "./types";

export type LoginStage =
  | { name: "password" }
  | { name: "passkey" }
  | { name: "totp" }
  | { name: "recovery-code" }
  | { name: "enrollment-secret" }
  | { name: "enrollment-confirm"; enrollment: MfaEnrollment }
  | { name: "recovery-codes"; codes: string[] };

export function stageAfterPassword(nextStep: LoginStep): LoginStage {
  switch (nextStep) {
    case "enroll_mfa":
      return { name: "enrollment-secret" };
    case "passkey":
      return { name: "passkey" };
    case "totp":
      return { name: "totp" };
  }
}
