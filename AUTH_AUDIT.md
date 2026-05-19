# Convex Auth Flow Audit Report

**Scope:** `convex/` directory + frontend auth integration  
**Auth Method:** Email magic link via `@convex-dev/auth` v0.0.92  
**Date:** 2026-05-18

---

## 1. Password Hashing

**Status: N/A**

This application uses **passwordless email magic link authentication**. There are no passwords stored, hashed, or verified by application code. The `Email` provider from `@convex-dev/auth` generates short-lived verification codes (10-minute expiry) and handles token cryptography internally.

---

## 2. Session Validation

### Backend
- All protected endpoints use `getAuthUserId(ctx)` from `@convex-dev/auth/server`, which validates the JWT against the `authTables` sessions.
- Authorization helpers in `convex/lib/authz.ts` provide consistent guards:
  - `requireUserId()` — ensures authenticated caller
  - `requireAppProfile()` — ensures profile exists
  - `requireRole()` — ensures role membership
- Internal mutations (e.g., `prepareJoin`) correctly receive propagated auth identity when called from actions (`ctx.runMutation`).

### Frontend
- `convex-svelte` client configured with `client.setAuth(async () => getAccessToken())`.
- Tokens are stored in **localStorage** via `PersistedState` (`runed`).

---

## 3. Findings & Edge Cases

### 🔴 P1 — Verification Tokens Logged in Plaintext
**File:** `convex/auth.ts:25-26`
```ts
console.log(`HomeBody login code for ${identifier}: ${token}`);
console.log(`HomeBody magic link for ${identifier}: ${magicLink}`);
```
**Risk:** If Convex logs are forwarded to external logging infrastructure or accessible to support staff, active login codes are exposed. An attacker with log access can impersonate any user within the 10-minute window.
**Fix:** Remove or redact token values from logs. If logging is required for debugging, log only the identifier and a truncated hash.

---

### 🔴 P1 — `signOut` Does Not Invalidate Server Session
**File:** `src/lib/auth/session.svelte.ts:90-96`
```ts
export function signOut() {
  storeTokens(null);
  window.location.assign("/");
}
```
**Risk:** The frontend never calls the backend `signOut` mutation exported from `convexAuth`. The session row in `authTables` and the refresh token remain valid until natural expiry. If tokens were exfiltrated (e.g., via XSS), the attacker can continue using them after the user "signs out."
**Fix:** Call `client.mutation(api.auth.signOut, {})` before clearing local storage.

---

### 🟡 P2 — Frontend Role Guard Allows Access When Role Unknown
**File:** `src/components/app/AuthGuard.svelte:18`
```ts
if (r === null) return true; // Role unknown — let the page handle server-side auth
```
**Risk:** If `cachedRole` is `null` (first load, cleared storage, or fetch failure), the guard returns `true` for **any** requested role, including `admin`. While Convex mutations/queries still enforce server-side authorization, the page shell and any static content in the `{@render children()}` snippet become visible before the role resolves.
**Fix:** Default to `false` when role is unknown, or show a loading skeleton until the role is fetched from the server.

---

### 🟡 P2 — Tokens Stored in localStorage (XSS Surface)
**File:** `src/lib/auth/session.svelte.ts`
**Risk:** `PersistedState` persists JWT and refresh token to `localStorage`. Any XSS vulnerability in the app (e.g., in video titles, class descriptions, or user-generated content) allows trivial token exfiltration via `localStorage.getItem(...)`.
**Mitigation:** `@convex-dev/auth` uses short-lived access tokens, but refresh tokens are long-lived. Consider migrating to `httpOnly` cookie-based sessions if the architecture allows, or implement strict CSP headers.

---

### 🟡 P2 — No Explicit CSRF/`state` Validation in Callback
**File:** `src/components/auth/CallbackHandler.svelte`
**Risk:** The callback handler exchanges `code` for tokens without validating a `state` nonce. While less critical for email magic links than OAuth redirects, a maliciously crafted link could trick a logged-in user into exchanging an attacker-supplied code. The short 10-minute expiry limits the window.
**Fix:** Add a `state` parameter check (or at minimum validate the `email` query param against the token payload if the library exposes it).

---

### 🟢 P3 — `code` Only Passed, `email` URL Param Ignored
**File:** `src/components/auth/CallbackHandler.svelte:15-16`
```ts
const result = await client.action(api.auth.signIn, { provider: "email", params: { code } });
```
**Note:** The magic link URL includes `email`, but the callback handler discards it. The `@convex-dev/auth` library likely encodes the email inside the code, so this is not a vulnerability—just an observation that the URL parameter is unused.

---

### 🟢 P3 — No Backend Rate-Limiting Configuration Visible
**File:** `convex/auth.ts`
**Note:** The `Email` provider is configured without explicit rate limiting. `@convex-dev/auth` may provide default rate limiting, but it is not visible in application code. Verify library defaults or add application-level rate limiting if sending real emails.

---

## 4. Positive Controls

| Control | Location | Assessment |
|---------|----------|------------|
| Duplicate profile race condition handled | `convex/lib/authz.ts:getOrCreateAppProfile` | ✅ After insert, queries for duplicates and deletes the extra row |
| Last admin demotion prevented | `convex/appProfiles.ts:assertNotLastAdminDemotion` | ✅ Checks at least 2 admins exist before demotion |
| Admin toggle protects admin roles | `convex/appProfiles.ts:toggleInstructorByEmail` | ✅ Rejects changing an admin's role via instructor toggle |
| Admin bootstrap is internal-only | `convex/appProfiles.ts:bootstrapAdminByEmail` | ✅ `internalMutation`; requires `ADMIN_BOOTSTRAP_EMAIL` env var |
| LiveKit token short TTL | `convex/livekit.ts:57` | ✅ 10-minute JWT TTL |
| Credit/reservation mutations use atomic checks | `convex/liveClasses.ts:reserve`, `cancelReservation` | ✅ Validates state before patching |
| Server-side auth enforced on all data mutations | All `mutation` files | ✅ Every mutation calls `requireUserId` or `getAuthUserId` |

---

## 5. Recommendations (Priority Order)

1. **Remove token logging** from `convex/auth.ts` (P1).
2. **Call backend `signOut`** before clearing local storage (P1).
3. **Harden `AuthGuard.svelte`** to deny access when role is unknown (P2).
4. **Evaluate token storage** — consider if `httpOnly` cookies are feasible (P2).
5. **Add `state` validation** to callback flow (P2).
6. **Verify `@convex-dev/auth` rate limiting** for email verification requests (P3).
