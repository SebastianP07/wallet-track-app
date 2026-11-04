import "server-only";

import { headers } from "next/headers";

import type { User } from "../domain/types";
import { SESSION_COOKIE_NAMES } from "../domain/session-cookie";
import { API_TIMEOUT_MS, apiInternalUrl } from "@/shared/bff/server-config";

export type ServerSession =
  | { status: "authenticated"; user: User }
  | { status: "unauthenticated" }
  | { status: "unavailable" };

function hasSessionCookie(cookieHeader: string): boolean {
  return SESSION_COOKIE_NAMES.some((name) => cookieHeader.includes(`${name}=`));
}

export async function getServerSession(): Promise<ServerSession> {
  const incoming = await headers();
  const cookie = incoming.get("cookie") ?? "";
  if (!hasSessionCookie(cookie)) {
    return { status: "unauthenticated" };
  }
  const apiUrl = apiInternalUrl();
  if (apiUrl === null) {
    return { status: "unavailable" };
  }

  const forwarded = new Headers({ accept: "application/json", cookie });
  const clientIp = incoming.get("x-forwarded-for");
  if (clientIp !== null) {
    forwarded.set("x-forwarded-for", clientIp);
  }

  try {
    const response = await fetch(`${apiUrl.replace(/\/$/, "")}/api/v1/me`, {
      headers: forwarded,
      cache: "no-store",
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
    });
    if (response.ok) {
      return { status: "authenticated", user: (await response.json()) as User };
    }
    return response.status === 401 ? { status: "unauthenticated" } : { status: "unavailable" };
  } catch {
    return { status: "unavailable" };
  }
}
