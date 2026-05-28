import type { CreditPool } from "$lib/features/credits/types";
import { creditPoolPrestige, type CreditPrestige } from "$lib/features/credits/creditPoolTheme";
import { CREDIT_UNIT_PRICE_ILS } from "$lib/features/credits/pricing";
import type { CelebrationMagnitude } from "./celebration.svelte";

/** 0 = subtle (vod) → 3 = full premium (oneOnOne, bulk). */
export type CreditExcitement = 0 | 1 | 2 | 3;

/** Continuous score for picking magnitude / layer sizes. */
export function creditCelebrationScore(pool: CreditPool, quantity = 1): number {
  const prestige = creditPoolPrestige(pool);
  const qty = Math.max(1, Math.floor(quantity));
  const qtyBoost = Math.min(1.25, Math.log2(qty + 1) * 0.42);
  return prestige + qtyBoost;
}

export function creditExcitementLevel(pool: CreditPool, quantity = 1): CreditExcitement {
  const score = creditCelebrationScore(pool, quantity);
  if (score < 0.85) return 0;
  if (score < 1.65) return 1;
  if (score < 2.45) return 2;
  return 3;
}

export function creditNudgeMagnitude(pool: CreditPool, quantity: number): CelebrationMagnitude {
  const level = creditExcitementLevel(pool, quantity);
  if (level === 0) return "nudge";
  if (level === 1) return "nudge";
  return "pick";
}

export function creditPaymentMagnitude(pool: CreditPool, quantity: number): CelebrationMagnitude {
  const level = creditExcitementLevel(pool, quantity);
  if (level === 0) return "nudge";
  if (level === 1) return "pick";
  if (level === 2) return "ribbon";
  return "triumph";
}

export function creditPaymentIntensity(pool: CreditPool, quantity: number): number {
  const level = creditExcitementLevel(pool, quantity);
  return Math.min(3, level) as 0 | 1 | 2 | 3;
}

/** Relative $ weight for mixed-cart checkout (optional). */
export function creditLineValueIls(pool: CreditPool, quantity: number): number {
  return CREDIT_UNIT_PRICE_ILS[pool] * Math.max(1, quantity);
}

export function dominantCreditPool(
  lines: ReadonlyArray<{ pool: CreditPool; quantity: number }>,
): CreditPool {
  let best: CreditPool = "vod";
  let bestValue = 0;
  for (const line of lines) {
    const value = creditLineValueIls(line.pool, line.quantity);
    if (value > bestValue) {
      bestValue = value;
      best = line.pool;
    }
  }
  return best;
}

export function prestigeReachClass(prestige: CreditPrestige): string {
  return `credit-prestige-${prestige}`;
}
