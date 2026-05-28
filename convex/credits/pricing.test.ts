import { describe, expect, test } from "bun:test";
import { quoteCreditCart, quoteCreditPurchase, roundMoneyIls } from "./pricing";

describe("credit purchase pricing", () => {
  test("single macroflow at list price", () => {
    const q = quoteCreditPurchase("vod", 1);
    expect(q.unitListIls).toBe(9.9);
    expect(q.totalIls).toBe(9.9);
    expect(q.discountPercent).toBe(0);
  });

  test("5 group credits get 10% off (max tier)", () => {
    const q = quoteCreditPurchase("live", 5);
    expect(q.listSubtotalIls).toBe(roundMoneyIls(44.9 * 5));
    expect(q.discountPercent).toBe(10);
    expect(q.totalIls).toBe(roundMoneyIls(q.listSubtotalIls * 0.9));
  });

  test("10 private credits capped at 10% off", () => {
    const q = quoteCreditPurchase("oneOnOne", 10);
    expect(q.discountPercent).toBe(10);
    expect(q.unitEffectiveIls).toBeLessThan(q.unitListIls);
  });

  test("20 macroflow still capped at 10% off", () => {
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
