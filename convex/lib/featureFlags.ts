/**
 * Backend feature flags. Keep in sync with `src/lib/features/subscriptions/featureFlags.ts`.
 */
export const SUBSCRIPTIONS_ENABLED = false;

/** Credit checkout — off until payment flow ships. */
export const CREDITS_PURCHASE_ENABLED = false;

export function assertSubscriptionsEnabled(): void {
  if (!SUBSCRIPTIONS_ENABLED) {
    throw new Error("שינוי מנוי אינו זמין כרגע. פנו לצוות לעדכון ידני.");
  }
}
