"use client";

/**
 * Minimal auth context for the MVP.
 *
 * Holds whether the user is signed in and exposes login/logout that persist JWT
 * tokens via {@link auth-store}. The actual OTP login UI and `/auth/me` fetch are
 * built in Epic 2 — this provides the shared state those screens plug into.
 *
 * Auth state is read with `useSyncExternalStore` so it stays in sync with the
 * token store (and other tabs) without writing state inside effects.
 */
import { createContext, useCallback, useContext, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import {
  type AuthTokens,
  clearTokens,
  getAuthSnapshot,
  getServerAuthSnapshot,
  setTokens,
  subscribe,
} from "./auth-store";

interface AuthContextValue {
  /** True once a valid access token is present. */
  isAuthenticated: boolean;
  /** False during SSR / before hydration — guards against auth UI flicker. */
  ready: boolean;
  login: (tokens: AuthTokens) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// `ready` flips to true only on the client, after hydration, with no effect.
const subscribeNoop = () => () => {};

export function AuthProvider({ children }: { children: ReactNode }) {
  const isAuthenticated = useSyncExternalStore(
    subscribe,
    getAuthSnapshot,
    getServerAuthSnapshot,
  );
  const ready = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  const login = useCallback((tokens: AuthTokens) => setTokens(tokens), []);
  const logout = useCallback(() => clearTokens(), []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return ctx;
}
