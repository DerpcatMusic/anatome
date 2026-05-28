/** Client-side fallback when `listPlans` is loading or unreachable (mirrors convex DEFAULT_PLANS). */
export const FALLBACK_PLANS = [
  {
    _id: "starter",
    _creationTime: 0,
    slug: "starter",
    nameHe: "בסיס תנועה",
    monthlyPriceIls: 119,
    platformFeeIls: 40,
    vodCreditValueIls: 10,
    liveCreditValueIls: 40,
    oneOnOneCreditValueIls: 140,
    vodCreditsPerMonth: 4,
    liveCreditsPerMonth: 1,
    oneOnOneCreditsPerMonth: 0,
    isActive: true,
  },
  {
    _id: "steady",
    _creationTime: 0,
    slug: "steady",
    nameHe: "תרגול קבוע",
    monthlyPriceIls: 199,
    platformFeeIls: 40,
    vodCreditValueIls: 10,
    liveCreditValueIls: 40,
    oneOnOneCreditValueIls: 140,
    vodCreditsPerMonth: 8,
    liveCreditsPerMonth: 2,
    oneOnOneCreditsPerMonth: 0,
    isActive: true,
  },
  {
    _id: "guided",
    _creationTime: 0,
    slug: "guided",
    nameHe: "ליווי אישי",
    monthlyPriceIls: 329,
    platformFeeIls: 40,
    vodCreditValueIls: 10,
    liveCreditValueIls: 40,
    oneOnOneCreditValueIls: 140,
    vodCreditsPerMonth: 8,
    liveCreditsPerMonth: 2,
    oneOnOneCreditsPerMonth: 1,
    isActive: true,
  },
  {
    _id: "intensive",
    _creationTime: 0,
    slug: "intensive",
    nameHe: "שיקום אינטנסיבי",
    monthlyPriceIls: 489,
    platformFeeIls: 40,
    vodCreditValueIls: 10,
    liveCreditValueIls: 40,
    oneOnOneCreditValueIls: 140,
    vodCreditsPerMonth: 12,
    liveCreditsPerMonth: 3,
    oneOnOneCreditsPerMonth: 2,
    isActive: true,
  },
] as const;

export type CatalogPlan = (typeof FALLBACK_PLANS)[number];

export function pickFeaturedPlan<T extends { slug: string }>(plans: T[]): T | null {
  return plans.find((p) => p.slug === "guided") ?? plans[0] ?? null;
}
