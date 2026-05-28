import type { CreditPool } from "./types";

/** Keep in sync with `convex/credits/pricing.ts`. */
export const CREDIT_UNIT_PRICE_ILS: Record<CreditPool, number> = {
  vod: 9.9,
  live: 44.9,
  oneOnOne: 149,
};

export const CREDIT_MAX_VOLUME_DISCOUNT_PERCENT = 10;

export const CREDIT_VOLUME_TIERS = [
  { minQty: 5, discountPercent: 10, label: "5+ · עד 10%" },
  { minQty: 3, discountPercent: 5, label: "3+ · 5%" },
  { minQty: 1, discountPercent: 0, label: "מחיר מלא" },
] as const;

export const CREDIT_PURCHASE_PRESETS = [1, 3, 5, 10, 20] as const;

export function roundMoneyIls(value: number): number {
  return Math.round(value * 100) / 100;
}

export function volumeDiscountPercent(quantity: number): number {
  const qty = Math.floor(quantity);
  const tier = CREDIT_VOLUME_TIERS.find((row) => qty >= row.minQty);
  const percent = tier?.discountPercent ?? 0;
  return Math.min(percent, CREDIT_MAX_VOLUME_DISCOUNT_PERCENT);
}

export type CreditPurchaseQuote = {
  pool: CreditPool;
  quantity: number;
  unitListIls: number;
  unitEffectiveIls: number;
  listSubtotalIls: number;
  discountPercent: number;
  discountIls: number;
  totalIls: number;
};

export type CreditCartLineInput = {
  pool: CreditPool;
  quantity: number;
};

export type CreditCartLineQuote = CreditPurchaseQuote & {
  lineTotalIls: number;
};

export type CreditCartQuote = {
  lines: CreditCartLineQuote[];
  listSubtotalIls: number;
  discountIls: number;
  totalIls: number;
};

export function quoteCreditPurchase(pool: CreditPool, quantity: number): CreditPurchaseQuote {
  const qty = Math.floor(quantity);
  if (!Number.isFinite(qty) || qty < 1) {
    throw new Error("כמות לא תקינה");
  }
  const unitListIls = CREDIT_UNIT_PRICE_ILS[pool];
  const discountPercent = volumeDiscountPercent(qty);
  const listSubtotalIls = roundMoneyIls(unitListIls * qty);
  const discountIls = roundMoneyIls((listSubtotalIls * discountPercent) / 100);
  const totalIls = roundMoneyIls(listSubtotalIls - discountIls);
  const unitEffectiveIls = roundMoneyIls(totalIls / qty);
  return {
    pool,
    quantity: qty,
    unitListIls,
    unitEffectiveIls,
    listSubtotalIls,
    discountPercent,
    discountIls,
    totalIls,
  };
}

function mergeCartLines(inputs: CreditCartLineInput[]): CreditCartLineInput[] {
  const byPool = new Map<CreditPool, number>();
  for (const row of inputs) {
    const qty = Math.floor(row.quantity);
    if (!Number.isFinite(qty) || qty < 1) continue;
    byPool.set(row.pool, (byPool.get(row.pool) ?? 0) + qty);
  }
  return [...byPool.entries()].map(([pool, quantity]) => ({ pool, quantity }));
}

export function quoteCreditCart(inputs: CreditCartLineInput[]): CreditCartQuote {
  const merged = mergeCartLines(inputs);
  if (merged.length === 0) {
    throw new Error("בחרו לפחות קרדיט אחד");
  }
  const lines = merged.map((row) => {
    const quote = quoteCreditPurchase(row.pool, row.quantity);
    return { ...quote, lineTotalIls: quote.totalIls };
  });
  const listSubtotalIls = roundMoneyIls(
    lines.reduce((sum, line) => sum + line.listSubtotalIls, 0),
  );
  const discountIls = roundMoneyIls(lines.reduce((sum, line) => sum + line.discountIls, 0));
  const totalIls = roundMoneyIls(lines.reduce((sum, line) => sum + line.lineTotalIls, 0));
  return { lines, listSubtotalIls, discountIls, totalIls };
}

export function formatIls(amount: number): string {
  return amount.toLocaleString("he-IL", {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

export function poolLabelHe(pool: CreditPool): string {
  switch (pool) {
    case "vod":
      return "מאקרופלו (מוקלט)";
    case "live":
      return "שיעור קבוצתי (לייב)";
    case "oneOnOne":
      return "שיעור אישי 1:1";
  }
}
