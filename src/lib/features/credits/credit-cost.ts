import type { CreditPool } from "./types";

export function creditRemaining(balance: number, cost: number): number {
  return Math.max(0, balance - cost);
}

export function canAffordCredit(balance: number, cost: number): boolean {
  return balance >= cost;
}

export type CreditCostPreview = {
  cost: number;
  balance: number;
  remaining: number;
  affordable: boolean;
  pool: CreditPool;
};

export function creditCostPreview(
  balance: number,
  cost: number,
  pool: CreditPool,
): CreditCostPreview {
  const safeCost = Math.max(0, cost);
  return {
    cost: safeCost,
    balance,
    remaining: creditRemaining(balance, safeCost),
    affordable: canAffordCredit(balance, safeCost),
    pool,
  };
}
