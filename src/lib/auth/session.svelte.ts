import { ConvexHttpClient } from "convex/browser";
import type { FunctionReference } from "convex/server";
import { PersistedState } from "runed";
import { api } from "$convex/_generated/api";
import { convex } from "$lib/convex/client";
import {
  dashboardPathForRole,
  dashboardPathFromCachedRole,
  type AppRole,
} from "$lib/auth/post-sign-in";

import { PUBLIC_CONVEX_CLIENT_URL } from "$env/static/public";
import { normalizeConvexDeploymentUrl } from "$lib/convex/deployment-url";

const convexDeploymentUrl = PUBLIC_CONVEX_CLIENT_URL
  ? normalizeConvexDeploymentUrl(PUBLIC_CONVEX_CLIENT_URL)
  : "";

export { dashboardPathForRole, dashboardPathFromCachedRole, type AppRole };

type Tokens = {
  token: string;
  refreshToken: string;
};

type AuthState = {
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string;
};

const namespace = `homebody:${convexDeploymentUrl || "ssr"}`;
const tokenKey = `${namespace}:jwt`;
const refreshTokenKey = `${namespace}:refresh`;

// Custom serializer handles legacy raw strings stored by the old manual localStorage code.
const stringSerializer = {
  serialize: (v: string | null) => (v === null ? "__null__" : JSON.stringify(v)),
  deserialize: (v: string): string | null | undefined => {
    if (v === "__null__") return null;
    try {
      return JSON.parse(v) as string | null;
    } catch {
      // Legacy raw string (JWT or refresh token) stored before PersistedState
      return v;
    }
  },
};

const tokenStore = new PersistedState<string | null>(tokenKey, null, {
  serializer: stringSerializer,
});
const refreshTokenStore = new PersistedState<string | null>(refreshTokenKey, null, {
  serializer: stringSerializer,
});

const roleKey = `${namespace}:role`;
const roleStore = new PersistedState<string | null>(roleKey, null, {
  serializer: stringSerializer,
});

// Module-level refresh deduplication — survives component re-mounts within one page session.
let refreshPromise: Promise<string | null> | null = null;
let convexAuthWired = false;
/** Ignore transient WS `onChange(false)` until Convex has authenticated once. */
let convexWsAuthEstablished = false;

const refreshLockKey = `${namespace}:refresh-lock`;

let state = $state<AuthState>({
  isLoading: true,
  isAuthenticated: false,
  error: "",
});

const expiredSessionMessage = "החיבור פג. אפשר להיכנס מחדש עם קוד חד־פעמי.";
const authNetworkTimeoutMs = 7000;

async function withTimeout<T>(promise: Promise<T>, message: string) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), authNetworkTimeoutMs);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
  }
}

function syncAuthState() {
  state.isAuthenticated = tokenStore.current !== null;
}

export function storeTokens(tokens: Tokens | null) {
  tokenStore.current = tokens?.token ?? null;
  refreshTokenStore.current = tokens?.refreshToken ?? null;
  if (tokens === null) {
    roleStore.current = null;
    convexWsAuthEstablished = false;
  }
  syncAuthState();
  state.isLoading = false;
  state.error = "";
}

export function setCachedRole(role: string | null) {
  roleStore.current = role;
}

export function getCachedRole(): string | null {
  return roleStore.current;
}

function clearStaleSession(message = expiredSessionMessage) {
  tokenStore.current = null;
  refreshTokenStore.current = null;
  syncAuthState();
  state.isLoading = false;
  state.error = message;
}

/**
 * Creates a one-off HTTP client authenticated with the given token.
 * In an MPA we NEVER use the shared WebSocket client for auth queries —
 * each HTTP call carries its own token explicitly, avoiding 401 races
 * that trigger refresh-token storms.
 */
function makeHttpClient(token: string) {
  return new ConvexHttpClient(convexDeploymentUrl, {
    auth: token,
    logger: false,
  });
}

async function refreshToken(): Promise<string | null> {
  // Deduplicate concurrent refresh attempts.
  if (refreshPromise !== null) {
    return refreshPromise;
  }

  refreshPromise = doRefreshToken();
  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

async function doRefreshToken(): Promise<string | null> {
  if (refreshTokenStore.current === null) {
    clearStaleSession();
    return null;
  }

  try {
    // Use an unauthenticated client for the refresh action itself.
    const client = new ConvexHttpClient(convexDeploymentUrl, {
      logger: false,
    });
    const result = await withTimeout(
      client.action(api.auth.signIn, {
        refreshToken: refreshTokenStore.current,
      }),
      "Refresh token timed out"
    );

    storeTokens(result.tokens ?? null);
    return tokenStore.current;
  } catch {
    clearStaleSession();
    return null;
  }
}

function isLikelyAuthError(reason: unknown) {
  const message = reason instanceof Error ? reason.message : String(reason);
  return /auth|token|jwt|unauth|not authenticated|authentication/i.test(message);
}

export function initAuth() {
  if (typeof window === "undefined") {
    return state;
  }

  // In an MPA every page is a full reload. Just read persisted tokens
  // and set state. Do NOT wire convex.setAuth() — that causes the
  // WebSocket client to refresh on every page load.
  syncAuthState();
  state.isLoading = false;

  return state;
}

export function getAuthState() {
  return state;
}

export function getAccessToken() {
  return tokenStore.current;
}

function isTokenExpiredOrNearExpiry(token: string, leewaySeconds = 120): boolean {
  try {
    const payload = JSON.parse(globalThis.atob(token.split(".")[1]));
    if (!payload.exp) return false;
    return payload.exp - leewaySeconds < Date.now() / 1000;
  } catch {
    return true;
  }
}

function hasPersistedSession(): boolean {
  return tokenStore.current !== null || refreshTokenStore.current !== null;
}

async function withRefreshLock<T>(callback: () => Promise<T>): Promise<T> {
  const lockManager = globalThis.navigator?.locks;
  if (lockManager !== undefined) {
    return await lockManager.request(refreshLockKey, callback);
  }
  return await callback();
}

/**
 * Token fetcher for Convex's WebSocket client.
 * Mirrors @convex-dev/auth's fetchAccessToken: return the cached JWT unless
 * Convex explicitly requests a refresh, and dedupe concurrent refresh calls.
 */
export async function getAccessTokenForConvex(
  args?: { forceRefreshToken: boolean }
): Promise<string | null> {
  if (!args?.forceRefreshToken) {
    return tokenStore.current;
  }

  const tokenBeforeLock = tokenStore.current;
  return await withRefreshLock(async () => {
    if (tokenStore.current !== tokenBeforeLock) {
      return tokenStore.current;
    }
    return await refreshToken();
  });
}

/**
 * Called by Convex when its internal auth state changes.
 * Only clear persisted tokens after WS auth was established and HTTP
 * session.resolve still fails (avoids sign-in loop on initial handshake).
 */
export function handleAuthChange(isAuthenticated: boolean) {
  if (isAuthenticated) {
    convexWsAuthEstablished = true;
    return;
  }

  if (!convexWsAuthEstablished || !hasPersistedSession()) {
    return;
  }

  void verifyPersistedSessionOrClear();
}

async function verifyPersistedSessionOrClear() {
  const session = await authQuery(api.users.session.resolve, {});
  if (session !== null) return;

  clearStaleSession();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("anatome:auth-open"));
  }
}

/**
 * Wire WebSocket auth once per page load when persisted tokens exist.
 * Avoid calling from reactive effects — each setAuth() resets Convex auth
 * state and retriggers refreshSession on the backend.
 */
export function wireConvexAuth(client: {
  setAuth: (
    fetchToken: (args: { forceRefreshToken: boolean }) => Promise<string | null>,
    onChange: (isAuthenticated: boolean) => void
  ) => void;
}) {
  if (typeof window === "undefined" || convexAuthWired || !hasPersistedSession()) {
    return;
  }

  convexAuthWired = true;
  client.setAuth(
    (args) => getAccessTokenForConvex(args),
    (isAuthenticated) => handleAuthChange(isAuthenticated)
  );
}

export async function authQuery<Query extends FunctionReference<"query">>(
  query: Query,
  args: Query["_args"]
): Promise<Query["_returnType"] | null> {
  let token = tokenStore.current;

  if (token === null) {
    token = await refreshToken();
    if (token === null) return null;
  }

  const client = makeHttpClient(token);

  try {
    return await client.query(query, args);
  } catch (reason) {
    if (!isLikelyAuthError(reason)) {
      throw reason;
    }

    // One retry after refresh
    token = await refreshToken();
    if (token === null) return null;

    const retryClient = makeHttpClient(token);
    try {
      return await retryClient.query(query, args);
    } catch (retryReason) {
      if (!isLikelyAuthError(retryReason)) throw retryReason;
      clearStaleSession();
      return null;
    }
  }
}

export async function startEmailSignIn(email: string) {
  await convex.action(api.auth.signIn, {
    provider: "email",
    params: {
      email: email.trim().toLowerCase(),
    },
  });
}

export async function verifyEmailCode(email: string, code: string) {
  const result = await convex.action(api.auth.signIn, {
    provider: "email",
    params: {
      email: email.trim().toLowerCase(),
      code: code.trim(),
    },
  });

  storeTokens(result.tokens ?? null);
  await completeSignIn();
}

export async function verifyMagicLinkCode(code: string) {
  const result = await convex.action(api.auth.signIn, {
    provider: "email",
    params: { code },
  });

  storeTokens(result.tokens ?? null);
  await completeSignIn();
}

/** Resolve role over HTTP and redirect to the correct app area. */
export async function completeSignIn() {
  if (!state.isAuthenticated) {
    window.location.assign("/");
    return;
  }

  const session = await authQuery(api.users.session.resolve, {});
  if (session === null) {
    clearStaleSession();
    window.location.assign("/");
    return;
  }

  setCachedRole(session.role);
  window.location.assign(dashboardPathForRole(session.role, session.needsOnboarding));
}

export async function signOut() {
  const tokenToSignOut = tokenStore.current;
  storeTokens(null);

  try {
    if (tokenToSignOut !== null) {
      const client = makeHttpClient(tokenToSignOut);
      await withTimeout(client.action(api.auth.signOut, {}), "Sign-out timed out");
    }
  } catch {
    // Local sign-out is already complete. Remote session cleanup is best-effort.
  }

  window.location.assign("/");
}

export function clearLocalSession() {
  storeTokens(null);
  window.location.assign("/");
}
