import type { PlanTierTheme } from "$lib/features/subscriptions/planTierTheme";
import type { CreditPool } from "$lib/features/credits/types";
import { creditPoolPrestige } from "$lib/features/credits/creditPoolTheme";

export type CelebrationKind = "plan" | "credit";

/** nudge = tiny; pick = browse tap; ribbon = thin full-width subscription accept; triumph = credit payment */
export type CelebrationMagnitude = "nudge" | "pick" | "ribbon" | "triumph";

export type CelebrationBurst = {
  key: number;
  kind: CelebrationKind;
  magnitude: CelebrationMagnitude;
  intensity: number;
  pool?: CreditPool;
};

export const celebration = $state<{ burst: CelebrationBurst | null }>({
  burst: null,
});

function nextBurst(partial: Omit<CelebrationBurst, "key">) {
  celebration.burst = {
    ...partial,
    key: (celebration.burst?.key ?? 0) + 1,
  };
}

/** Browsing — tapped a plan card (not used for subscriptions). */
export function firePlanPick(tier: PlanTierTheme["tier"]) {
  nextBurst({ kind: "plan", magnitude: "pick", intensity: tier });
}

/** Subscription confirmed — thin stream across the full page width. */
export function fireSubscriptionAccepted(tier: PlanTierTheme["tier"]) {
  nextBurst({ kind: "plan", magnitude: "ribbon", intensity: tier });
}

/** Adding credits to cart. */
export function fireCreditNudge(pool: CreditPool) {
  nextBurst({
    kind: "credit",
    magnitude: "nudge",
    intensity: creditPoolPrestige(pool),
    pool,
  });
}

/**
 * Payment cleared — big multi-cannon moment (semantic “YAY!”).
 */
export function firePaymentTriumph(options: {
  kind: CelebrationKind;
  planTier?: PlanTierTheme["tier"];
  creditPool?: CreditPool;
  creditPools?: CreditPool[];
}) {
  let pool = options.creditPool;
  if (!pool && options.creditPools?.length) {
    if (options.creditPools.includes("oneOnOne")) pool = "oneOnOne";
    else if (options.creditPools.includes("live")) pool = "live";
    else pool = "vod";
  }

  const intensity =
    options.kind === "plan" && options.planTier !== undefined
      ? options.planTier
      : pool
        ? creditPoolPrestige(pool) + 1
        : 3;

  nextBurst({
    kind: options.kind,
    magnitude: "triumph",
    intensity: Math.min(3, intensity),
    pool,
  });
}

/** @deprecated Use firePlanPick */
export function firePlanCelebration(tier: PlanTierTheme["tier"]) {
  firePlanPick(tier);
}

/** @deprecated Use fireCreditNudge or firePaymentTriumph */
export function fireCreditCelebration(pool: CreditPool, scale: "select" | "purchase" = "purchase") {
  if (scale === "select") fireCreditNudge(pool);
  else firePaymentTriumph({ kind: "credit", creditPool: pool });
}

/** @deprecated Use firePaymentTriumph */
export function fireCreditCartCelebration(pools: CreditPool[]) {
  firePaymentTriumph({ kind: "credit", creditPools: pools });
}

export function fireBillingSuccessCelebration(orderKind: "credit" | "subscription") {
  if (orderKind === "credit") {
    firePaymentTriumph({ kind: "credit", creditPool: "oneOnOne" });
    return;
  }
  fireSubscriptionAccepted(2);
}
