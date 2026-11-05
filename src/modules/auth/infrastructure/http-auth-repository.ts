import type { AuthRepository } from "../application/auth-repository";
import type { components } from "@/shared/api/openapi";
import { apiGet, apiPost } from "@/shared/api/http-client";

type Schemas = components["schemas"];

export const httpAuthRepository: AuthRepository = {
  async loginWithPassword(credentials) {
    const body: Schemas["PasswordLoginRequest"] = credentials;
    const { nextStep } = await apiPost<Schemas["LoginStep"]>("/auth/login/password", body);
    return nextStep;
  },
  loginWithTotp(code) {
    const body: Schemas["TotpCodeRequest"] = { code };
    return apiPost<Schemas["User"]>("/auth/login/totp", body);
  },
  loginWithRecoveryCode(code) {
    const body: Schemas["RecoveryCodeRequest"] = { code };
    return apiPost<Schemas["User"]>("/auth/login/recovery-code", body);
  },
  startPasskeyLogin() {
    return apiPost<Schemas["PasskeyAssertionOptions"]>("/auth/login/passkey/options");
  },
  loginWithPasskey(credential) {
    const body: Schemas["PasskeyAssertionRequest"] = { credential };
    return apiPost<Schemas["User"]>("/auth/login/passkey", body);
  },
  startMfaEnrollment(enrollmentSecret) {
    const body: Schemas["MfaEnrollmentStartRequest"] = { enrollmentSecret };
    return apiPost<Schemas["MfaEnrollment"]>("/auth/mfa/enrollment", body);
  },
  confirmMfaEnrollment(code) {
    const body: Schemas["TotpCodeRequest"] = { code };
    return apiPost<Schemas["MfaEnrollmentResult"]>("/auth/mfa/enrollment/confirm", body);
  },
  getCurrentUser() {
    return apiGet<Schemas["User"]>("/me");
  },
  logout() {
    return apiPost<void>("/auth/logout");
  },
  logoutAll() {
    return apiPost<void>("/auth/logout-all");
  },
};
