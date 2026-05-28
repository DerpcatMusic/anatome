import type { CreditPool } from "./types";
import { CREDIT_UNIT_PRICE_ILS } from "./pricing";

/** Visual prestige 0 = entry, 2 = premium (matches unit price ladder). */
export type CreditPrestige = 0 | 1 | 2;

const PRESTIGE_BY_POOL: Record<CreditPool, CreditPrestige> = {
  vod: 0,
  live: 1,
  oneOnOne: 2,
};

export function creditPoolPrestige(pool: CreditPool): CreditPrestige {
  return PRESTIGE_BY_POOL[pool];
}

export function creditUnitPriceIls(pool: CreditPool): number {
  return CREDIT_UNIT_PRICE_ILS[pool];
}

export function creditPoolPsychology(pool: CreditPool): {
  tone: string;
  ariaHint: string;
} {
  switch (pool) {
    case "vod":
      return {
        tone: "למידה עצמית — סרטונים מוקלטים",
        ariaHint: "קרדיט למידה, צבע סגול-חכם",
      };
    case "live":
      return {
        tone: "יחד בלייב — קבוצה וחברות",
        ariaHint: "קרדיט לייב קבוצתי, צבע כחול-חברתי",
      };
    case "oneOnOne":
      return {
        tone: "ליווי אישי פרימיום",
        ariaHint: "קרדיט אישי יוקרתי, צבע זהב",
      };
  }
}
