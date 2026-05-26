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
/** In-flight WS token refresh — pause authenticated queries until done. */
let pendingAuthRefresh = 0;
/** WS has a valid token and no refresh in progress; safe for useQuery subscriptions. */
let queryAuthReady = $state(false);

function syncQueryAuthReady() {
  const next =
    state.isAuthenticated && convexWsAuthEstablished && pendingAuthRefresh === 0;
  if (queryAuthReady === next) return;
  queryAuthReady = next;
  // #region agent log
  agentDebugLog("A", "session.svelte.ts:syncQueryAuthReady", "queryAuthReady changed", {
    queryAuthReady: next,
    cachedRole: roleStore.current,
  });
  // #endregion
}

// #region agent log
function agentDebugLog(
  hypothesisId: string,
  location: string,
  message: string,
  data: Record<string, unknown> = {},
) {
  fetch("http://127.0.0.1:7635/ingest/0058f30b-7dc0-4748-98aa-19722c5574a5", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "3a81d3",
    },
    body: JSON.stringify({
      sessionId: "3a81d3",
      hypothesisId,
      location,
      message,
      data,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
}
// #endregion

const refreshLockKey = `${namespace}:refresh-lock`;

let state = $state<AuthState>({
  isLoading: true,
  isAuthenticated: false,
  error: "",
});

const expiredSessionMessage = "החיבור פג. אפשר להיכנס מחדש עם קוד חד־פעמי.";
const authNetworkTimeoutMs = 7000;
const RETURN_TO_KEY = "anatome:returnTo";

const RETURN_TO_ALLOW = ["/library", "/u/library", "/watch"] as const;

function isAllowedReturnTo(path: string): boolean {
  if (!path.startsWith("/") || path.startsWith("//")) return false;
  if (path.includes("://")) return false;
  return RETURN_TO_ALLOW.some(
    (allowed) => path === allowed || path.startsWith(`${allowed}?`),
  );
}

/** Remember where to land after sign-in (browse / watch intent). */
export function setReturnTo(path: string) {
  if (typeof window === "undefined" || !isAllowedReturnTo(path)) return;
  sessionStorage.setItem(RETURN_TO_KEY, path);
}

export function consumeReturnTo(): string | null {
  if (typeof window === "undefined") return null;
  const stored = sessionStorage.getItem(RETURN_TO_KEY);
  sessionStorage.removeItem(RETURN_TO_KEY);
  if (stored === null || !isAllowedReturnTo(stored)) return null;
  return stored;
}

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
    pendingAuthRefresh = 0;
    queryAuthReady = false;
  }
  syncAuthState();
  state.isLoading = false;
  state.error = "";
  syncQueryAuthReady();
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

  // #region agent log
  agentDebugLog("A", "session.svelte.ts:initAuth", "initAuth complete", {
    isAuthenticated: state.isAuthenticated,
    hasAccessToken: tokenStore.current !== null,
    hasRefreshToken: refreshTokenStore.current !== null,
    convexWsAuthEstablished,
    tokenExpired: tokenStore.current
      ? isTokenExpiredOrNearExpiry(tokenStore.current)
      : null,
  });
  // #endregion

  return state;
}

/**
 * True when authenticated WebSocket queries can run (handshake done, not mid-refresh).
 * Use instead of `auth.isAuthenticated` for useQuery `() => … ? {} : "skip"`.
 */
export function canRunAuthenticatedQuery(): boolean {
  return queryAuthReady;
}

/** Debug: WS auth handshake finished (onChange(true) at least once). */
export function isConvexWsAuthEstablished(): boolean {
  return convexWsAuthEstablished;
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
    const token = tokenStore.current;
    // #region agent log
    agentDebugLog("B", "session.svelte.ts:getAccessTokenForConvex", "return cached token", {
      forceRefresh: false,
      hasToken: token !== null,
      tokenExpired: token ? isTokenExpiredOrNearExpiry(token) : null,
    });
    // #endregion
    return token;
  }

  const tokenBeforeLock = tokenStore.current;
  // #region agent log
  agentDebugLog("B", "session.svelte.ts:getAccessTokenForConvex", "force refresh requested", {
    hasTokenBefore: tokenBeforeLock !== null,
    tokenExpiredBefore: tokenBeforeLock
      ? isTokenExpiredOrNearExpiry(tokenBeforeLock)
      : null,
  });
  // #endregion
  pendingAuthRefresh += 1;
  syncQueryAuthReady();
  try {
    return await withRefreshLock(async () => {
      if (tokenStore.current !== tokenBeforeLock) {
        return tokenStore.current;
      }
      const refreshed = await refreshToken();
      // #region agent log
      agentDebugLog("B", "session.svelte.ts:getAccessTokenForConvex", "force refresh done", {
        hasTokenAfter: refreshed !== null,
      });
      // #endregion
      return refreshed;
    });
  } finally {
    pendingAuthRefresh = Math.max(0, pendingAuthRefresh - 1);
    syncQueryAuthReady();
  }
}

/**
 * Called by Convex when its internal auth state changes.
 * Only clear persisted tokens after WS auth was established and HTTP
 * session.resolve still fails (avoids sign-in loop on initial handshake).
 */
export function handleAuthChange(isAuthenticated: boolean) {
  // #region agent log
  agentDebugLog("C", "session.svelte.ts:handleAuthChange", "WS auth onChange", {
    isAuthenticated,
    convexWsAuthEstablishedBefore: convexWsAuthEstablished,
    hasPersistedSession: hasPersistedSession(),
  });
  // #endregion

  if (isAuthenticated) {
    convexWsAuthEstablished = true;
    syncQueryAuthReady();
    return;
  }

  queryAuthReady = false;

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
    // #region agent log
    agentDebugLog("E", "session.svelte.ts:wireConvexAuth", "wireConvexAuth skipped", {
      isBrowser: typeof window !== "undefined",
      convexAuthWired,
      hasPersistedSession: hasPersistedSession(),
    });
    // #endregion
    return;
  }

  convexAuthWired = true;
  // #region agent log
  agentDebugLog("E", "session.svelte.ts:wireConvexAuth", "wireConvexAuth calling setAuth", {
    hasAccessToken: tokenStore.current !== null,
    hasRefreshToken: refreshTokenStore.current !== null,
    tokenExpired: tokenStore.current
      ? isTokenExpiredOrNearExpiry(tokenStore.current)
      : null,
  });
  // #endregion
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

  const returnTo = consumeReturnTo();
  if (returnTo !== null) {
    window.location.assign(returnTo);
    return;
  }

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
