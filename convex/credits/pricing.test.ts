import { describe, expect, test } from "bun:test";
import { quoteCreditCart, quoteCreditPurchase, roundMoneyIls } from "./pricing";

describe("credit purchase pricing", () => {
  test("single macroflow at list price", () => {
    const q = quoteCreditPurchase("vod", 1);
    expect(q.unitListIls).toBe(9.9);
    expect(q.totalIls).toBe(9.9);
    expect(q.discountPercent).toBe(0);
  });

  test("9 credits — no volume discount", () => {
    const q = quoteCreditPurchase("live", 9);
    expect(q.discountPercent).toBe(0);
    expect(q.totalIls).toBe(roundMoneyIls(44.9 * 9));
  });

  test("10+ credits get 10% off per pool", () => {
    const q = quoteCreditPurchase("live", 10);
    expect(q.listSubtotalIls).toBe(roundMoneyIls(44.9 * 10));
    expect(q.discountPercent).toBe(10);
    expect(q.totalIls).toBe(roundMoneyIls(q.listSubtotalIls * 0.9));
  });

  test("20 macroflow at 10% off", () => {
    const q = quoteCreditPurchase("vod", 20);
    expect(q.discountPercent).toBe(10);
    expect(q.totalIls).toBe(roundMoneyIls(9.9 * 20 * 0.9));
  });

  test("multi-pool cart sums lines", () => {
    const cart = quoteCreditCart([
      { pool: "vod", quantity: 2 },
      { pool: "live", quantity: 1 },
    ]);
    expect(cart.lines).toHaveLength(2);
    expect(cart.totalIls).toBe(
      roundMoneyIls(cart.lines[0]!.lineTotalIls + cart.lines[1]!.lineTotalIls),
    );
  });
});
