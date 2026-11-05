import type { SecurityRepository } from "../application/security-repository";
import type { components } from "@/shared/api/openapi";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/shared/api/http-client";

type Schemas = components["schemas"];

export const httpSecurityRepository: SecurityRepository = {
  async listPasskeys() {
    const { items } = await apiGet<Schemas["PasskeyList"]>("/auth/passkeys");
    return items;
  },
  startPasskeyRegistration(proof) {
    return apiPost<Schemas["PasskeyCreationOptions"]>("/auth/passkeys/registration/options", proof);
  },
  finishPasskeyRegistration(name, credential) {
    const body: Schemas["PasskeyRegistrationRequest"] = { name, credential };
    return apiPost<Schemas["Passkey"]>("/auth/passkeys/registration", body);
  },
  renamePasskey(id, name) {
    const body: Schemas["PasskeyRename"] = { name };
    return apiPatch<Schemas["Passkey"]>(`/auth/passkeys/${encodeURIComponent(id)}`, body);
  },
  removePasskey(id, proof) {
    return apiPost<void>(`/auth/passkeys/${encodeURIComponent(id)}/remove`, proof);
  },
  async listSessions() {
    const { items } = await apiGet<Schemas["SessionList"]>("/auth/sessions");
    return items;
  },
  revokeSession(id) {
    return apiDelete(`/auth/sessions/${encodeURIComponent(id)}`);
  },
};
