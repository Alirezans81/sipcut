/**
 * JWT token storage exposed as a tiny subscribable store.
 *
 * The backend issues access + refresh tokens (SimpleJWT). The MVP keeps them in
 * localStorage for simplicity; the rest of the app only ever touches tokens
 * through these helpers so the mechanism can change later in one place. The
 * store is observable so React can read it with `useSyncExternalStore` (see
 * auth-context.tsx) without writing state inside effects.
 */
const ACCESS_KEY = "sipcut.access";
const REFRESH_KEY = "sipcut.refresh";

export interface AuthTokens {
  access: string;
  refresh: string;
}

const isBrowser = () => typeof window !== "undefined";

const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of listeners) listener();
}

/** Subscribe to auth changes (login/logout). Returns an unsubscribe fn. */
export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getAccessToken(): string | null {
  return isBrowser() ? window.localStorage.getItem(ACCESS_KEY) : null;
}

export function getRefreshToken(): string | null {
  return isBrowser() ? window.localStorage.getItem(REFRESH_KEY) : null;
}

export function setTokens(tokens: AuthTokens): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(ACCESS_KEY, tokens.access);
  window.localStorage.setItem(REFRESH_KEY, tokens.refresh);
  notify();
}

export function setAccessToken(access: string): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(ACCESS_KEY, access);
  notify();
}

export function clearTokens(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(ACCESS_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
  notify();
}

export function isAuthenticated(): boolean {
  return getAccessToken() !== null;
}

/** Snapshot helpers for `useSyncExternalStore`. */
export const getAuthSnapshot = (): boolean => isAuthenticated();
export const getServerAuthSnapshot = (): boolean => false;
