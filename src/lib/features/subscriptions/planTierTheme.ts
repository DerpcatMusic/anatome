export type PlanSlug = "starter" | "steady" | "guided" | "intensive";

export type PlanTierTheme = {
  slug: PlanSlug;
  tier: 0 | 1 | 2 | 3;
  label: string;
  tagline: string;
  /** CSS class on plan cards in the picker */
  cardClass: string;
  /** CardCom hosted page stylesheet */
  cardcomCssPath: string;
};

const THEMES: Record<PlanSlug, PlanTierTheme> = {
  starter: {
    slug: "starter",
    tier: 0,
    label: "בסיס",
    tagline: "התחלה רגועה — מוקלט ולייב",
    cardClass: "plan-tier plan-tier--0",
    cardcomCssPath: "/cardcom/checkout-starter.css",
  },
  steady: {
    slug: "steady",
    tier: 1,
    label: "קבוע",
    tagline: "שגרה שבועית עם יותר קרדיטים",
    cardClass: "plan-tier plan-tier--1",
    cardcomCssPath: "/cardcom/checkout-steady.css",
  },
  guided: {
    slug: "guided",
    tier: 2,
    label: "מומלץ",
    tagline: "ליווי אישי + תרגול מלא",
    cardClass: "plan-tier plan-tier--2 plan-tier--featured",
    cardcomCssPath: "/cardcom/checkout-guided.css",
  },
  intensive: {
    slug: "intensive",
    tier: 3,
    label: "פרימיום",
    tagline: "שיקום אינטנסיבי — הכי מקיף",
    cardClass: "plan-tier plan-tier--3 plan-tier--premium",
    cardcomCssPath: "/cardcom/checkout-intensive.css",
  },
};

export function planTierTheme(slug: string): PlanTierTheme {
  if (slug in THEMES) return THEMES[slug as PlanSlug];
  return THEMES.guided;
}

export function isPlanSlug(slug: string): slug is PlanSlug {
  return slug in THEMES;
}
