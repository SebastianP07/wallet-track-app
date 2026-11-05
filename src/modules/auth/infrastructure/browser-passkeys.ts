import type { PasskeyAuthenticator } from "../application/passkey-authenticator";
import { PasskeyCeremonyError, type PasskeyCeremonyFailure } from "../domain/passkey-failure";
import type { PasskeyCredentialResponse } from "../domain/types";

type Descriptor = { id: string; transports?: string[] };

function decode(base64url: string): Uint8Array<ArrayBuffer> {
  const binary = atob(base64url.replaceAll("-", "+").replaceAll("_", "/"));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function encode(buffer: ArrayBuffer): string {
  const binary = String.fromCharCode(...new Uint8Array(buffer));
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function toDescriptors(descriptors: Descriptor[] | undefined): PublicKeyCredentialDescriptor[] | undefined {
  return descriptors?.map(({ id, transports }) => ({
    type: "public-key",
    id: decode(id),
    transports: transports as AuthenticatorTransport[] | undefined,
  }));
}

function failureOf(error: unknown): PasskeyCeremonyFailure {
  const name = error instanceof DOMException ? error.name : "";
  switch (name) {
    // The browser answers the same when there is no matching credential and when the prompt times out.
    case "NotAllowedError":
    case "AbortError":
      return "cancelled";
    case "InvalidStateError":
      return "already-registered";
    case "NotSupportedError":
      return "unsupported";
    default:
      return "failed";
  }
}

function isSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.PublicKeyCredential === "function" &&
    typeof navigator.credentials?.create === "function" &&
    typeof navigator.credentials?.get === "function"
  );
}

async function run(ceremony: () => Promise<Credential | null>): Promise<PublicKeyCredential> {
  if (!isSupported()) {
    throw new PasskeyCeremonyError("unsupported");
  }
  let credential: Credential | null;
  try {
    credential = await ceremony();
  } catch (error) {
    throw new PasskeyCeremonyError(failureOf(error));
  }
  if (credential === null) {
    throw new PasskeyCeremonyError("cancelled");
  }
  return credential as PublicKeyCredential;
}

function describeCredential(
  credential: PublicKeyCredential,
  response: PasskeyCredentialResponse["response"],
): PasskeyCredentialResponse {
  return {
    id: credential.id,
    rawId: encode(credential.rawId),
    type: "public-key",
    authenticatorAttachment: credential.authenticatorAttachment ?? undefined,
    clientExtensionResults: { ...credential.getClientExtensionResults() },
    response,
  };
}

export const browserPasskeys: PasskeyAuthenticator = {
  isSupported,

  async create({ publicKey }) {
    const credential = await run(() =>
      navigator.credentials.create({
        publicKey: {
          rp: publicKey.rp,
          user: { ...publicKey.user, id: decode(publicKey.user.id) },
          challenge: decode(publicKey.challenge),
          pubKeyCredParams: publicKey.pubKeyCredParams,
          timeout: publicKey.timeout,
          excludeCredentials: toDescriptors(publicKey.excludeCredentials),
          authenticatorSelection: publicKey.authenticatorSelection as AuthenticatorSelectionCriteria,
          attestation: publicKey.attestation as AttestationConveyancePreference,
        },
      }),
    );
    const response = credential.response as AuthenticatorAttestationResponse;
    return describeCredential(credential, {
      clientDataJSON: encode(response.clientDataJSON),
      attestationObject: encode(response.attestationObject),
      transports: response.getTransports?.() ?? [],
    });
  },

  async get({ publicKey }) {
    const credential = await run(() =>
      navigator.credentials.get({
        publicKey: {
          challenge: decode(publicKey.challenge),
          timeout: publicKey.timeout,
          rpId: publicKey.rpId,
          allowCredentials: toDescriptors(publicKey.allowCredentials),
          userVerification: publicKey.userVerification as UserVerificationRequirement,
        },
      }),
    );
    const response = credential.response as AuthenticatorAssertionResponse;
    return describeCredential(credential, {
      clientDataJSON: encode(response.clientDataJSON),
      authenticatorData: encode(response.authenticatorData),
      signature: encode(response.signature),
      userHandle: response.userHandle ? encode(response.userHandle) : undefined,
    });
  },
};
