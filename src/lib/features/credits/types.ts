export type CreditPool = "vod" | "live" | "oneOnOne";

export type CreditBalances = Record<CreditPool, number>;

export const ALL_CREDIT_POOLS: CreditPool[] = ["vod", "live", "oneOnOne"];
