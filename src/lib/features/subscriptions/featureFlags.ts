/**
 * Client feature flags. Billing sandbox must match `convex/lib/featureFlags.ts`.
 *
 * Local: enabled when running `vite dev` unless PUBLIC_BILLING_SANDBOX_ENABLED=false.
 * Preview/prod build: set PUBLIC_BILLING_SANDBOX_ENABLED=true only for a staging URL.
 */
import { dev } from "$app/environment";
import { env as publicEnv } from "$env/dynamic/public";

function isBillingSandboxEnabled(): boolean {
  const flag = publicEnv.PUBLIC_BILLING_SANDBOX_ENABLED?.trim().toLowerCase();
  if (flag === "true") return true;
  if (flag === "false") return false;
  return dev;
}

/** Self-serve plan picker + lifecycle (dev sandbox by default). */
export const SUBSCRIPTIONS_ENABLED = isBillingSandboxEnabled();

/** CardCom checkout + fulfillment (dev sandbox by default). */
export const CHECKOUT_ENABLED = isBillingSandboxEnabled();

export const BILLING_SANDBOX_MODE = isBillingSandboxEnabled();

/** À-la-carte credit packs (dev sandbox by default). */
export const CREDITS_PURCHASE_ENABLED = isBillingSandboxEnabled();

/**
 * CardCom Open Fields (per-field iframes). Off until CardCom enables terminal + docs.
 * Set PUBLIC_CARDCOM_OPEN_FIELDS=true when integration pack is ready.
 */
export const CARDCOM_OPEN_FIELDS_ENABLED =
  publicEnv.PUBLIC_CARDCOM_OPEN_FIELDS?.trim().toLowerCase() === "true";
