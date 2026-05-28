/**
 * Backend feature flags. Keep billing sandbox in sync with
 * `src/lib/features/subscriptions/featureFlags.ts`.
 */
import { isBillingSandboxEnabled } from "./billingSandbox";

/** Self-serve subscriptions — on in Convex dev / sandbox deployments. */
export const SUBSCRIPTIONS_ENABLED = isBillingSandboxEnabled();

/** CardCom checkout + fulfillment — on with subscriptions in sandbox. */
export const CHECKOUT_ENABLED = isBillingSandboxEnabled();

/** À-la-carte credit packs — on with billing sandbox. */
export const CREDITS_PURCHASE_ENABLED = isBillingSandboxEnabled();

export function assertCreditsPurchaseEnabled(): void {
  if (!CREDITS_PURCHASE_ENABLED) {
    throw new Error("רכישת קרדיטים אינה זמינה כרגע.");
  }
}

export function assertSubscriptionsEnabled(): void {
  if (!SUBSCRIPTIONS_ENABLED) {
    throw new Error("שינוי מנוי אינו זמין כרגע. פנו לצוות לעדכון ידני.");
  }
}

export function assertCheckoutEnabled(): void {
  if (!CHECKOUT_ENABLED) {
    throw new Error("תשלום אינו זמין כרגע. פנו לצוות.");
  }
}
