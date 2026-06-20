/**
 * Thin typed fetch wrapper around the SipCut API.
 *
 * Responsibilities (kept deliberately small — business logic lives in the
 * backend, see docs/ARCHITECTURE.md):
 *  - Prefix requests with the configured API base URL.
 *  - Attach the JWT access token.
 *  - Transparently refresh the access token once on a 401, then retry.
 *  - Surface a typed {@link ApiError} on non-2xx responses.
 */
import { API_BASE_URL } from "./config";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
} from "./auth-store";

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, message: string, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  /** JSON body — serialized automatically. Use `formData` for file uploads. */
  json?: unknown;
  formData?: FormData;
  /** Skip attaching the auth header (used by the auth endpoints themselves). */
  auth?: boolean;
}

async function refreshAccessToken(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;

  const res = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) {
    clearTokens();
    return false;
  }

  const data = (await res.json()) as { access: string };
  setAccessToken(data.access);
  return true;
}

async function rawRequest<T>(
  path: string,
  options: RequestOptions,
  isRetry = false,
): Promise<T> {
  const { json, formData, auth = true, headers, ...rest } = options;

  const finalHeaders = new Headers(headers);
  let body: BodyInit | undefined;

  if (formData) {
    body = formData; // let the browser set the multipart boundary
  } else if (json !== undefined) {
    finalHeaders.set("Content-Type", "application/json");
    body = JSON.stringify(json);
  }

  if (auth) {
    const token = getAccessToken();
    if (token) finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    body,
  });

  // Attempt a single transparent refresh + retry on auth failure.
  if (res.status === 401 && auth && !isRetry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) return rawRequest<T>(path, options, true);
  }

  if (res.status === 204) return undefined as T;

  const contentType = res.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await res.json()
    : await res.text();

  if (!res.ok) {
    const message =
      (typeof payload === "object" &&
        payload !== null &&
        ("detail" in payload
          ? String((payload as { detail: unknown }).detail)
          : undefined)) ||
      `Request failed with status ${res.status}`;
    throw new ApiError(res.status, message, payload);
  }

  return payload as T;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    rawRequest<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, options?: RequestOptions) =>
    rawRequest<T>(path, { ...options, method: "POST" }),
  patch: <T>(path: string, options?: RequestOptions) =>
    rawRequest<T>(path, { ...options, method: "PATCH" }),
  put: <T>(path: string, options?: RequestOptions) =>
    rawRequest<T>(path, { ...options, method: "PUT" }),
  delete: <T>(path: string, options?: RequestOptions) =>
    rawRequest<T>(path, { ...options, method: "DELETE" }),
};
