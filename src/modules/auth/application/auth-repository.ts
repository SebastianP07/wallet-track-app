import type {
  LoginStep,
  MfaEnrollment,
  MfaEnrollmentResult,
  PasskeyAssertionOptions,
  PasskeyCredentialResponse,
  PasswordLoginRequest,
  User,
} from "../domain/types";

export interface AuthRepository {
  loginWithPassword(credentials: PasswordLoginRequest): Promise<LoginStep>;
  loginWithTotp(code: string): Promise<User>;
  loginWithRecoveryCode(code: string): Promise<User>;
  startPasskeyLogin(): Promise<PasskeyAssertionOptions>;
  loginWithPasskey(credential: PasskeyCredentialResponse): Promise<User>;
  startMfaEnrollment(enrollmentSecret: string): Promise<MfaEnrollment>;
  confirmMfaEnrollment(code: string): Promise<MfaEnrollmentResult>;
  getCurrentUser(): Promise<User>;
  logout(): Promise<void>;
  logoutAll(): Promise<void>;
}
