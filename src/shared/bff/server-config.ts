import "server-only";

const isProduction = process.env.NODE_ENV === "production";
// Set by server.mjs.
const CLIENT_IP_RESOLVED = Symbol.for("wallet-track.client-ip-resolved");

export function apiInternalUrl(): string | null {
  return process.env.API_INTERNAL_URL ?? (isProduction ? null : "http://127.0.0.1:8080");
}

export function appOrigin(): string | null {
  return process.env.APP_ORIGIN ?? (isProduction ? null : "http://localhost:3000");
}

export function clientIpIsResolvedByServer(): boolean {
  return (globalThis as Record<symbol, unknown>)[CLIENT_IP_RESOLVED] === true;
}

export const API_TIMEOUT_MS = 15_000;
