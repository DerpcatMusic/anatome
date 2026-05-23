export const CREDIT_PRICES_ILS = {
  platformMonthly: 40,
  macroflow: 10,
  groupLive: 40,
  oneOnOne: 140,
} as const;

export const DEFAULT_PLANS = [
  {
    slug: "starter",
    nameHe: "בסיס תנועה",
    monthlyPriceIls: 119,
    vodCreditsPerMonth: 4,
    liveCreditsPerMonth: 1,
    oneOnOneCreditsPerMonth: 0,
  },
  {
    slug: "steady",
    nameHe: "תרגול קבוע",
    monthlyPriceIls: 199,
    vodCreditsPerMonth: 8,
    liveCreditsPerMonth: 2,
    oneOnOneCreditsPerMonth: 0,
  },
  {
    slug: "guided",
    nameHe: "ליווי אישי",
    monthlyPriceIls: 329,
    vodCreditsPerMonth: 8,
    liveCreditsPerMonth: 2,
    oneOnOneCreditsPerMonth: 1,
  },
  {
    slug: "intensive",
    nameHe: "שיקום אינטנסיבי",
    monthlyPriceIls: 489,
    vodCreditsPerMonth: 12,
    liveCreditsPerMonth: 3,
    oneOnOneCreditsPerMonth: 2,
  },
] as const;

export function planValueIls(plan: {
  vodCreditsPerMonth: number;
  liveCreditsPerMonth: number;
  oneOnOneCreditsPerMonth: number;
}) {
  return CREDIT_PRICES_ILS.platformMonthly +
    plan.vodCreditsPerMonth * CREDIT_PRICES_ILS.macroflow +
    plan.liveCreditsPerMonth * CREDIT_PRICES_ILS.groupLive +
    plan.oneOnOneCreditsPerMonth * CREDIT_PRICES_ILS.oneOnOne;
}

export function planPayload(plan: (typeof DEFAULT_PLANS)[number]) {
  return {
    ...plan,
    platformFeeIls: CREDIT_PRICES_ILS.platformMonthly,
    vodCreditValueIls: CREDIT_PRICES_ILS.macroflow,
    liveCreditValueIls: CREDIT_PRICES_ILS.groupLive,
    oneOnOneCreditValueIls: CREDIT_PRICES_ILS.oneOnOne,
    isActive: true,
  };
}
