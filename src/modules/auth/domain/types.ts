import type { components } from "@/shared/api/openapi";

export type User = components["schemas"]["User"];
export type LoginStep = components["schemas"]["LoginStep"]["nextStep"];
export type PasswordLoginRequest = components["schemas"]["PasswordLoginRequest"];
export type MfaEnrollment = components["schemas"]["MfaEnrollment"];
export type MfaEnrollmentResult = components["schemas"]["MfaEnrollmentResult"];
