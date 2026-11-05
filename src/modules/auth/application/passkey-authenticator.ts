import type {
  PasskeyAssertionOptions,
  PasskeyCreationOptions,
  PasskeyCredentialResponse,
} from "../domain/types";

// Both ceremonies reject with a PasskeyCeremonyError, never a browser exception.
export interface PasskeyAuthenticator {
  isSupported(): boolean;
  create(options: PasskeyCreationOptions): Promise<PasskeyCredentialResponse>;
  get(options: PasskeyAssertionOptions): Promise<PasskeyCredentialResponse>;
}
