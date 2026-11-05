import type { components } from "@/shared/api/openapi";

export type User = components["schemas"]["User"];
export type LoginStep = components["schemas"]["LoginStep"]["nextStep"];
export type PasswordLoginRequest = components["schemas"]["PasswordLoginRequest"];
export type MfaEnrollment = components["schemas"]["MfaEnrollment"];
export type MfaEnrollmentResult = components["schemas"]["MfaEnrollmentResult"];
export type Passkey = components["schemas"]["Passkey"];
export type ActiveSession = components["schemas"]["Session"];
export type SecondFactorProof = components["schemas"]["SecondFactorProof"];
export type PasskeyCreationOptions = components["schemas"]["PasskeyCreationOptions"];
export type PasskeyAssertionOptions = components["schemas"]["PasskeyAssertionOptions"];
export type PasskeyCredentialResponse = components["schemas"]["PasskeyCredentialResponse"];
