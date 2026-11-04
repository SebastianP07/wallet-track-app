import "server-only";

import {
  API_TIMEOUT_MS,
  apiInternalUrl,
  appOrigin,
  clientIpIsResolvedByServer,
} from "./server-config";

const SAFE_METHODS = new Set(["GET", "HEAD"]);
const FORWARDED_REQUEST_HEADERS = [
  "accept",
  "content-type",
  "cookie",
  "origin",
  "user-agent",
  "x-csrf-token",
  // Set from the socket by server.mjs, overwriting whatever the client sent.
  "x-forwarded-for",
];
const DROPPED_RESPONSE_HEADERS = new Set([
  "connection",
  "content-encoding",
  "content-length",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "set-cookie",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);
const BODYLESS_STATUSES = new Set([204, 205, 304]);
const PROBLEM_TITLES: Record<number, string> = {
  403: "Forbidden",
  404: "Not Found",
  500: "Internal Server Error",
  502: "Bad Gateway",
};

function problem(status: number, detail: string): Response {
  return Response.json(
    { type: "about:blank", title: PROBLEM_TITLES[status], status, detail },
    {
      status,
      headers: {
        "Content-Type": "application/problem+json",
        "Cache-Control": "no-store",
      },
    },
  );
}

function hasAcceptableOrigin(request: Request): boolean {
  return (
    SAFE_METHODS.has(request.method) || request.headers.get("origin") === appOrigin()
  );
}

function targetUrl(apiUrl: string, segments: string[], search: string): string | null {
  const [version, ...rest] = segments;
  const isTraversal = segments.some((s) => s === "" || s === "." || s === "..");
  if (version !== "v1" || rest.length === 0 || isTraversal) {
    return null;
  }
  const path = segments.map(encodeURIComponent).join("/");
  return `${apiUrl.replace(/\/$/, "")}/api/${path}${search}`;
}

function buildRequestHeaders(request: Request): Headers {
  const headers = new Headers({ "X-Request-ID": crypto.randomUUID() });
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value !== null) {
      headers.set(name, value);
    }
  }
  return headers;
}

function buildResponseHeaders(upstream: Response): Headers {
  const headers = new Headers();
  upstream.headers.forEach((value, name) => {
    if (!DROPPED_RESPONSE_HEADERS.has(name)) {
      headers.set(name, value);
    }
  });
  for (const cookie of upstream.headers.getSetCookie()) {
    headers.append("Set-Cookie", cookie);
  }
  headers.set("Cache-Control", "no-store");
  return headers;
}

function failureCode(error: unknown): string {
  if (error instanceof Error) {
    const cause = error.cause as { code?: unknown } | undefined;
    return typeof cause?.code === "string" ? cause.code : error.name;
  }
  return "unknown";
}

export async function forwardToApi(request: Request, segments: string[]): Promise<Response> {
  const apiUrl = apiInternalUrl();
  if (!clientIpIsResolvedByServer() || apiUrl === null || appOrigin() === null) {
    console.error("bff: refusing requests; run server.mjs with API_INTERNAL_URL and APP_ORIGIN set");
    return problem(500, "The service is misconfigured.");
  }
  if (!hasAcceptableOrigin(request)) {
    return problem(403, "Request rejected.");
  }
  const url = targetUrl(apiUrl, segments, new URL(request.url).search);
  if (url === null) {
    return problem(404, "No such resource.");
  }

  const hasBody = !SAFE_METHODS.has(request.method) && request.body !== null;
  const init: RequestInit & { duplex?: "half" } = {
    method: request.method,
    headers: buildRequestHeaders(request),
    body: hasBody ? request.body : undefined,
    cache: "no-store",
    redirect: "manual",
    signal: AbortSignal.any([request.signal, AbortSignal.timeout(API_TIMEOUT_MS)]),
    ...(hasBody ? { duplex: "half" as const } : {}),
  };

  let upstream: Response;
  try {
    upstream = await fetch(url, init);
  } catch (error) {
    console.error(`bff: API unreachable (${request.method}): ${failureCode(error)}`);
    return problem(502, "The service is unavailable.");
  }

  return new Response(BODYLESS_STATUSES.has(upstream.status) ? null : upstream.body, {
    status: upstream.status,
    headers: buildResponseHeaders(upstream),
  });
}
