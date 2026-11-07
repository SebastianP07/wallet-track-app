import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE_NAMES } from "@/modules/auth/domain/session-cookie";
import { buildContentSecurityPolicy } from "@/shared/security/content-security-policy";

const PUBLIC_PATHS = new Set(["/login"]);

export function proxy(request: NextRequest) {
  const hasSessionCookie = SESSION_COOKIE_NAMES.some((name) => request.cookies.has(name));
  if (!hasSessionCookie && !PUBLIC_PATHS.has(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const contentSecurityPolicy = buildContentSecurityPolicy({
    nonce,
    isDevelopment: process.env.NODE_ENV === "development",
    upgradeInsecureRequests: process.env.APP_ORIGIN?.startsWith("https://") ?? false,
  });

  // Next.js reads the nonce from the request's CSP header and applies it to its own tags.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("Content-Security-Policy", contentSecurityPolicy);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", contentSecurityPolicy);
  return response;
}

export const config = {
  // The PWA's files have to load with no session: a browser fetches them without the cookie, or while signed out.
  matcher: [
    "/((?!(?:api|healthz|icons)(?:/|$)|_next/static|_next/image|favicon\\.ico|(?:sw\\.js|manifest\\.webmanifest|offline\\.(?:html|js|css))$).*)",
  ],
};
