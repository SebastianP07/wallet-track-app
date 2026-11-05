import type {
  ActiveSession,
  Passkey,
  PasskeyCreationOptions,
  PasskeyCredentialResponse,
  SecondFactorProof,
} from "../domain/types";

export interface SecurityRepository {
  listPasskeys(): Promise<Passkey[]>;
  startPasskeyRegistration(proof: SecondFactorProof): Promise<PasskeyCreationOptions>;
  finishPasskeyRegistration(name: string, credential: PasskeyCredentialResponse): Promise<Passkey>;
  renamePasskey(id: string, name: string): Promise<Passkey>;
  removePasskey(id: string, proof: SecondFactorProof): Promise<void>;
  listSessions(): Promise<ActiveSession[]>;
  revokeSession(id: string): Promise<void>;
}
