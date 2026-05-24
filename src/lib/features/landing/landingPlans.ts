/** Marketing copy for pricing cards — mirrors `convex/subscriptions/plans.ts` defaults. */
export const LANDING_PLANS = [
  {
    slug: "starter",
    nameHe: "בסיס תנועה",
    monthlyPriceIls: 119,
    vodCreditsPerMonth: 4,
    liveCreditsPerMonth: 1,
    oneOnOneCreditsPerMonth: 0,
    platformFeeIls: 40,
  },
  {
    slug: "steady",
    nameHe: "תרגול קבוע",
    monthlyPriceIls: 199,
    vodCreditsPerMonth: 8,
    liveCreditsPerMonth: 2,
    oneOnOneCreditsPerMonth: 0,
    platformFeeIls: 40,
  },
  {
    slug: "guided",
    nameHe: "ליווי אישי",
    monthlyPriceIls: 329,
    vodCreditsPerMonth: 8,
    liveCreditsPerMonth: 2,
    oneOnOneCreditsPerMonth: 1,
    platformFeeIls: 40,
  },
  {
    slug: "intensive",
    nameHe: "שיקום אינטנסיבי",
    monthlyPriceIls: 489,
    vodCreditsPerMonth: 12,
    liveCreditsPerMonth: 3,
    oneOnOneCreditsPerMonth: 2,
    platformFeeIls: 40,
  },
] as const;

export const PLAN_DESCRIPTIONS: Record<string, string> = {
  starter: "כולל את דמי הפלטפורמה, 4 סרטוני macroflow, ושיעור לייב קבוצתי אחד.",
  steady: "למי שרוצה קצב שבועי: 8 סרטוני macroflow ו-2 לייבים קבוצתיים.",
  guided: "מוסיף קרדיט 1:1 חודשי לליווי אישי לצד וידאו ולייבים.",
  intensive: "מסלול כמעט מלא עם יותר פגישות אישיות ויותר תרגול חודשי.",
};
