import type { PlanTierTheme } from "$lib/features/subscriptions/planTierTheme";
import type { CreditPool } from "$lib/features/credits/types";
import {
  creditCelebrationScore,
  creditExcitementLevel,
  creditNudgeMagnitude,
  creditPaymentIntensity,
  creditPaymentMagnitude,
} from "./creditCelebration";
import { burstProfileFromBurst, celebrationBurstLifetimeMs } from "./confettiLayers";

export type CelebrationKind = "plan" | "credit";

export type CelebrationMagnitude = "nudge" | "pick" | "ribbon" | "triumph";

export type CelebrationBurstSource = "tap" | "checkout";

export type CelebrationBurst = {
  key: number;
  kind: CelebrationKind;
  magnitude: CelebrationMagnitude;
  intensity: number;
  pool?: CreditPool;
  /** Cart line size — scales credit celebration up/down. */
  quantity?: number;
  /** Tap (+) vs completed payment — same magnitude, different spectacle. */
  source?: CelebrationBurstSource;
};

/** Active bursts stack — new shots never cancel previous ones. */
export const celebration = $state<{ bursts: CelebrationBurst[] }>({
  bursts: [],
});

let burstKeySeq = 0;

const MAX_TOTAL_BURST = 14;

const MAX_PER_MAGNITUDE: Record<CelebrationMagnitude, number> = {
  nudge: 16,
  pick: 4,
  ribbon: 3,
  triumph: 2,
};

function profileFromBurst(burst: CelebrationBurst) {
  return burstProfileFromBurst(burst);
}

function scheduleBurstRemoval(key: number, lifetimeMs: number) {
  if (typeof window === "undefined") return;
  window.setTimeout(() => {
    celebration.bursts = celebration.bursts.filter((b) => b.key !== key);
  }, lifetimeMs);
}

function addBurst(partial: Omit<CelebrationBurst, "key">) {
  const key = ++burstKeySeq;
  const burst: CelebrationBurst = { key, ...partial };

  let bursts = [...celebration.bursts, burst];

  const sameMagnitude = bursts.filter((b) => b.magnitude === burst.magnitude);
  const cap = MAX_PER_MAGNITUDE[burst.magnitude];
  if (sameMagnitude.length > cap) {
    const dropKey = sameMagnitude[0]?.key;
    if (dropKey !== undefined) {
      bursts = bursts.filter((b) => b.key !== dropKey);
    }
  }

  if (bursts.length > MAX_TOTAL_BURST) {
    bursts = bursts.slice(-MAX_TOTAL_BURST);
  }

  celebration.bursts = bursts;

  const lifetime = celebrationBurstLifetimeMs(profileFromBurst(burst));
  scheduleBurstRemoval(key, lifetime);
}

export function firePlanPick(tier: PlanTierTheme["tier"]) {
  addBurst({ kind: "plan", magnitude: "pick", intensity: tier });
}

export function fireSubscriptionAccepted(tier: PlanTierTheme["tier"]) {
  addBurst({ kind: "plan", magnitude: "ribbon", intensity: tier });
}

export function fireCreditNudge(pool: CreditPool, quantity = 1) {
  const qty = Math.max(1, Math.floor(quantity));
  addBurst({
    kind: "credit",
    magnitude: creditNudgeMagnitude(pool, qty),
    intensity: creditExcitementLevel(pool, qty),
    pool,
    quantity: qty,
    source: "tap",
  });
}

export function firePaymentTriumph(options: {
  kind: CelebrationKind;
  planTier?: PlanTierTheme["tier"];
  creditPool?: CreditPool;
  creditPools?: CreditPool[];
  creditLines?: ReadonlyArray<{ pool: CreditPool; quantity: number }>;
}) {
  if (options.kind === "credit" && options.creditLines?.length) {
    fireCreditCartCelebration(options.creditLines);
    return;
  }

  let pool = options.creditPool;
  if (!pool && options.creditPools?.length) {
    if (options.creditPools.includes("oneOnOne")) pool = "oneOnOne";
    else if (options.creditPools.includes("live")) pool = "live";
    else pool = "vod";
  }

  if (options.kind === "credit" && pool) {
    fireCreditPurchaseCelebration(pool, 1);
    return;
  }

  const intensity =
    options.kind === "plan" && options.planTier !== undefined ? options.planTier : 3;

  addBurst({
    kind: options.kind,
    magnitude: "triumph",
    intensity: Math.min(3, intensity),
    pool,
  });
}

/** One celebration per cart line — pool + quantity set the spectacle. */
export function fireCreditPurchaseCelebration(pool: CreditPool, quantity: number) {
  const qty = Math.max(1, Math.floor(quantity));
  addBurst({
    kind: "credit",
    magnitude: creditPaymentMagnitude(pool, qty),
    intensity: creditPaymentIntensity(pool, qty),
    pool,
    quantity: qty,
    source: "checkout",
  });
}

export function fireCreditCartCelebration(
  lines: ReadonlyArray<{ pool: CreditPool; quantity: number }>,
) {
  const sorted = [...lines]
    .filter((line) => line.quantity > 0)
    .sort(
      (a, b) =>
        creditCelebrationScore(a.pool, a.quantity) - creditCelebrationScore(b.pool, b.quantity),
    );

  for (const line of sorted) {
    fireCreditPurchaseCelebration(line.pool, line.quantity);
  }
}

export function firePlanCelebration(tier: PlanTierTheme["tier"]) {
  firePlanPick(tier);
}

export function fireCreditCelebration(pool: CreditPool, scale: "select" | "purchase" = "purchase") {
  if (scale === "select") fireCreditNudge(pool);
  else firePaymentTriumph({ kind: "credit", creditPool: pool });
}


export function fireBillingSuccessCelebration(
  orderKind: "credit" | "subscription",
  creditLines?: ReadonlyArray<{ pool: CreditPool; quantity: number }>,
) {
  if (orderKind === "credit") {
    if (creditLines?.length) {
      fireCreditCartCelebration(creditLines);
    } else {
      fireCreditPurchaseCelebration("oneOnOne", 1);
    }
    return;
  }
  fireSubscriptionAccepted(2);
}
