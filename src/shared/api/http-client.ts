import { clearOfflineData } from "@/shared/pwa/offline-data";

const BASE_PATH = "/api/v1";
const NETWORK_FAILURE_STATUS = 0;

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly retryAfterSeconds: number | null = null,
  ) {
    super(`API request failed with status ${status}`);
    this.name = "ApiError";
  }
}

export function statusOf(error: unknown): number {
  return error instanceof ApiError ? error.status : NETWORK_FAILURE_STATUS;
}

async function send(path: string, init: RequestInit): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(`${BASE_PATH}${path}`, {
      ...init,
      cache: "no-store",
      credentials: "same-origin",
      headers: { Accept: "application/json", ...init.headers },
    });
  } catch {
    throw new ApiError(NETWORK_FAILURE_STATUS);
  }
  // Here rather than in each section, so that no 401 can leave the saved Dashboard behind.
  if (response.status === 401) {
    void clearOfflineData();
  }
  return response;
}

function toApiError(response: Response): ApiError {
  const retryAfter = Number.parseInt(response.headers.get("Retry-After") ?? "", 10);
  return new ApiError(response.status, Number.isNaN(retryAfter) ? null : retryAfter);
}

// Chromium keeps a response in flight until its body is read, and the status says all a caller needs.
async function drain(response: Response): Promise<void> {
  try {
    await response.arrayBuffer();
  } catch {
    // The connection failing now changes nothing: the error being reported is the status.
  }
}

async function parse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    await drain(response);
    throw toApiError(response);
  }
  return (response.status === 204 ? undefined : await response.json()) as T;
}

let csrfToken: string | null = null;

async function fetchCsrfToken(): Promise<string> {
  const { csrfToken: token } = await parse<{ csrfToken: string }>(
    await send("/auth/csrf", { method: "GET" }),
  );
  csrfToken = token;
  return token;
}

export async function apiGet<T>(path: string): Promise<T> {
  return parse<T>(await send(path, { method: "GET" }));
}

export interface DownloadedFile {
  blob: Blob;
  fileName: string | null;
}

const FILE_NAME_IN_HEADER = /filename="([^"]+)"/;

export async function apiGetFile(path: string, accept: string): Promise<DownloadedFile> {
  const response = await send(path, { method: "GET", headers: { Accept: accept } });
  if (!response.ok) {
    await drain(response);
    throw toApiError(response);
  }
  const fileName = FILE_NAME_IN_HEADER.exec(response.headers.get("Content-Disposition") ?? "")?.[1] ?? null;
  return { blob: await response.blob(), fileName };
}

async function sendMutation<T>(method: string, path: string, body?: unknown): Promise<T> {
  const attempt = async (token: string) =>
    send(path, {
      method,
      headers: {
        "X-CSRF-Token": token,
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

  const first = await attempt(csrfToken ?? (await fetchCsrfToken()));
  // A 403 means the token check ran before the handler, so a retry cannot repeat any effect.
  if (first.status !== 403) {
    return parse<T>(first);
  }
  await drain(first);
  return parse<T>(await attempt(await fetchCsrfToken()));
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return sendMutation<T>("POST", path, body);
}

export function apiPatch<T>(path: string, body: unknown): Promise<T> {
  return sendMutation<T>("PATCH", path, body);
}

export function apiPut<T>(path: string): Promise<T> {
  return sendMutation<T>("PUT", path);
}

export function apiDelete<T = void>(path: string): Promise<T> {
  return sendMutation<T>("DELETE", path);
}
