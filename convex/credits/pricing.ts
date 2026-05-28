import type { CreditPool } from "./lib";

/** List price per credit (ILS) — psychological .90 endings. */
export const CREDIT_UNIT_PRICE_ILS: Record<CreditPool, number> = {
  vod: 9.9,
  live: 44.9,
  oneOnOne: 149,
};

export const CREDIT_MAX_VOLUME_DISCOUNT_PERCENT = 10;

/** Highest `minQty` first — first match wins. 10% only from 10 units of the same pool. */
export const CREDIT_VOLUME_DISCOUNT_MIN_QTY = 10;

export const CREDIT_VOLUME_TIERS = [
  { minQty: CREDIT_VOLUME_DISCOUNT_MIN_QTY, discountPercent: 10 },
  { minQty: 1, discountPercent: 0 },
] as const;

export const CREDIT_PURCHASE_QUANTITY_PRESETS = [1, 3, 5, 10, 20] as const;
export const CREDIT_PURCHASE_MAX_QUANTITY = 50;

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

export function quoteCreditPurchase(
  pool: CreditPool,
  quantity: number,
): CreditPurchaseQuote {
  const qty = Math.floor(quantity);
  if (!Number.isFinite(qty) || qty < 1) {
    throw new Error("כמות קרדיטים חייבת להיות לפחות 1");
  }
  if (qty > CREDIT_PURCHASE_MAX_QUANTITY) {
    throw new Error(`ניתן לרכוש עד ${CREDIT_PURCHASE_MAX_QUANTITY} קרדיטים מסוג אחד בפעם אחת`);
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
    throw new Error("בחרו לפחות קרדיט אחד לרכישה");
  }

  const lines: CreditCartLineQuote[] = merged.map((row) => {
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

export function creditPoolLabelHe(pool: CreditPool): string {
  switch (pool) {
    case "vod":
      return "מאקרופלו (מוקלט)";
    case "live":
      return "שיעור קבוצתי (לייב)";
    case "oneOnOne":
      return "שיעור אישי 1:1";
  }
}

export function creditProductDescription(pool: CreditPool, quantity: number): string {
  return `${quantity} קרדיטים · ${creditPoolLabelHe(pool)}`;
}

export function creditCartProductDescription(cart: CreditCartQuote): string {
  if (cart.lines.length === 1) {
    const line = cart.lines[0]!;
    return creditProductDescription(line.pool, line.quantity);
  }
  const parts = cart.lines.map((line) => `${line.quantity}× ${creditPoolLabelHe(line.pool)}`);
  return `חבילת קרדיטים: ${parts.join(" · ")}`;
}
