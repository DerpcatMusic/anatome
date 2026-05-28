/**
 * Canonical list of editable landing copy, in page order.
 * Slugs map to `landing.*` keys in `src/lib/i18n/generated/he/index.ts`, except:
 * - `landing.plans.*` → `landingPlans.ts`
 * - `landing.experience.scrollHint` → hardcoded in ExperienceSection (migrate to i18n when ready)
 */

import { PLAN_DESCRIPTIONS } from "$lib/features/landing/landingPlans";

/** Format version for exports and round-trip parsing. */
export const LANDING_COPY_FORMAT = "homebody-landing-copy/v1";

export type LandingCopyFieldDef = {
  /** Stable id, e.g. `landing.hero.lead` — do not change when editing copy in Docs. */
  slug: string;
  /** Human label in the export (Hebrew). */
  label: string;
  hint?: string;
};

export type LandingCopySectionDef = {
  /** Section anchor, e.g. `hero` */
  id: string;
  /** Section heading in the export */
  title: string;
  /** Order on the marketing landing page (lower = higher on page) */
  order: number;
  fields: LandingCopyFieldDef[];
};

const faqFields = (): LandingCopyFieldDef[] => {
  const items: LandingCopyFieldDef[] = [
    { slug: "landing.faq.headline", label: "כותרת מדור" },
  ];
  for (let i = 1; i <= 7; i++) {
    items.push(
      { slug: `landing.faq.q${i}`, label: `שאלה ${i}` },
      { slug: `landing.faq.a${i}`, label: `תשובה ${i}` },
    );
  }
  return items;
};

const planDescriptionFields = (): LandingCopyFieldDef[] =>
  Object.keys(PLAN_DESCRIPTIONS).map((planSlug) => ({
    slug: `landing.plans.${planSlug}`,
    label: `תיאור מסלול «${planSlug}» (Convex fallback)`,
    hint: "מוצג כשאין תיאור מהשרת — עריכה ב-landingPlans.ts",
  }));

/** Single source of truth for landing copy export / import. */
export const LANDING_COPY_SECTIONS: LandingCopySectionDef[] = [
  {
    id: "seo",
    title: "SEO (מטא)",
    order: 0,
    fields: [
      { slug: "landing.seo.pageTitle", label: "כותרת דף (title)" },
      { slug: "landing.seo.pageDescription", label: "תיאור מטא (description)" },
      { slug: "landing.seo.breadcrumbHome", label: "פירור לחם — דף הבית" },
    ],
  },
  {
    id: "hero",
    title: "גיבור (Hero)",
    order: 10,
    fields: [
      {
        slug: "landing.hero.headlineBefore",
        label: "כותרת ראשית — לפני הדגש",
        hint: "מוצמד לפני span מודגש",
      },
      {
        slug: "landing.hero.headlineAccent",
        label: "כותרת ראשית — קטע מודגש",
      },
      {
        slug: "landing.hero.headlineAfter",
        label: "כותרת ראשית — אחרי הדגש",
      },
      { slug: "landing.hero.lead", label: "פסקת משנה" },
      { slug: "landing.hero.ctaPrimary", label: "כפתור ראשי" },
      { slug: "landing.hero.ctaSecondary", label: "כפתור משני (עוגן #about)" },
      { slug: "landing.hero.note", label: "הערת שוליים מתחת לכפתורים" },
      { slug: "landing.hero.scrollHint", label: "רמז גלילה (דקורטיבי)" },
    ],
  },
  {
    id: "about",
    title: "על המאמנת (About)",
    order: 20,
    fields: [
      { slug: "landing.instructor.sectionEyebrow", label: "מעל הכותרת (eyebrow)" },
      { slug: "landing.instructor.sectionHeadline", label: "כותרת מדור" },
      { slug: "landing.instructor.subtitle", label: "תת-כותרת / תפקיד" },
      { slug: "landing.instructor.storyOrigin1", label: "סיפור — פסקה 1" },
      { slug: "landing.instructor.storyOrigin2", label: "סיפור — פסקה 2" },
      { slug: "landing.instructor.whyMeHeadline", label: "כותרת «למה איתי»" },
      { slug: "landing.instructor.credTrainingTitle", label: "קרדיט 1 — כותרת" },
      { slug: "landing.instructor.credTraining", label: "קרדיט 1 — גוף" },
      { slug: "landing.instructor.credExperienceTitle", label: "קרדיט 2 — כותרת" },
      { slug: "landing.instructor.credExperience", label: "קרדיט 2 — גוף" },
      { slug: "landing.instructor.credMissionTitle", label: "קרדיט 3 — כותרת" },
      { slug: "landing.instructor.credMission", label: "קרדיט 3 — גוף" },
      { slug: "landing.instructor.storyClosing", label: "סיכום / סגירה (מודגש)" },
      { slug: "landing.images.aboutAlt", label: "טקסט חלופי לתמונה" },
    ],
  },
  {
    id: "philosophy",
    title: "למה מהבית (Philosophy)",
    order: 30,
    fields: [
      { slug: "landing.philosophy.headline", label: "כותרת" },
      {
        slug: "landing.philosophy.bodyBefore",
        label: "גוף — לפני קו חוצה (אם ריק, אין strike)",
      },
      {
        slug: "landing.philosophy.bodyStrike",
        label: "גוף — קטע עם קו חוצה",
        hint: "מוצג רק אם לא ריק",
      },
      { slug: "landing.philosophy.bodyAfter", label: "גוף — אחרי קו חוצה" },
    ],
  },
  {
    id: "steps",
    title: "איך מתחילים (Steps)",
    order: 40,
    fields: [
      { slug: "landing.steps.headline", label: "כותרת מדור" },
      { slug: "landing.steps.step1Title", label: "שלב 1 — כותרת" },
      { slug: "landing.steps.step1Desc", label: "שלב 1 — תיאור" },
      { slug: "landing.steps.step2Title", label: "שלב 2 — כותרת" },
      { slug: "landing.steps.step2Desc", label: "שלב 2 — תיאור" },
      { slug: "landing.steps.step3Title", label: "שלב 3 — כותרת" },
      { slug: "landing.steps.step3Desc", label: "שלב 3 — תיאור" },
      { slug: "landing.steps.step4Title", label: "שלב 4 — כותרת" },
      { slug: "landing.steps.step4Desc", label: "שלב 4 — תיאור" },
    ],
  },
  {
    id: "experience",
    title: "איך מתרגלים (Experience / Pillars)",
    order: 50,
    fields: [
      { slug: "landing.pillars.headline", label: "כותרת מדור" },
      { slug: "landing.pillars.lead", label: "פסקת משנה" },
      {
        slug: "landing.experience.scrollHint",
        label: "רמז גלילה בבנטו",
        hint: "כרגע קשיח ב-ExperienceSection.svelte",
      },
      { slug: "landing.preview.videoPlaceholderTitle", label: "כרטיס תצוגה — כותרת" },
      { slug: "landing.preview.videoPlaceholderSubtitle", label: "כרטיס תצוגה — משנה" },
      { slug: "landing.pillars.macroTitle", label: "עומק — כותרת" },
      { slug: "landing.pillars.macroLead", label: "עומק — משנה" },
      { slug: "landing.pillars.macroBody", label: "עומק — גוף" },
      { slug: "landing.pillars.microTitle", label: "ממוקד — כותרת" },
      { slug: "landing.pillars.microLead", label: "ממוקד — משנה" },
      { slug: "landing.pillars.microBody", label: "ממוקד — גוף" },
      { slug: "landing.pillars.liveTitle", label: "לייב — כותרת" },
      { slug: "landing.pillars.liveLead", label: "לייב — משנה" },
      { slug: "landing.pillars.liveBody", label: "לייב — גוף" },
      { slug: "landing.images.sessionAnatomyAlt", label: "alt — אנטומיה" },
      { slug: "landing.images.sessionAdaptiveAlt", label: "alt — התאמה" },
      { slug: "landing.images.sessionPaceAlt", label: "alt — קצב" },
      { slug: "landing.images.pillarMicroAlt", label: "alt — ממוקד" },
      { slug: "landing.images.pillarLiveAlt", label: "alt — לייב" },
    ],
  },
  {
    id: "pricing",
    title: "מחירים (Pricing)",
    order: 60,
    fields: [
      { slug: "landing.pricing.headline", label: "כותרת" },
      { slug: "landing.pricing.lead", label: "פסקת משנה" },
      { slug: "landing.pricing.featuredBadge", label: "תג מסלול מומלץ" },
      { slug: "landing.pricing.planNoteFallback", label: "תיאור ברירת מחדל למסלול" },
      { slug: "landing.pricing.perMonth", label: "סיומת מחיר (לחודש)" },
      { slug: "landing.pricing.ctaButton", label: "כפתור בחירת מסלול" },
      { slug: "landing.pricing.guarantee", label: "שורת ערבות בתחתית" },
      ...planDescriptionFields(),
    ],
  },
  {
    id: "faq",
    title: "שאלות נפוצות (FAQ)",
    order: 70,
    fields: faqFields(),
  },
  {
    id: "cta",
    title: "קריאה לפעולה (CTA)",
    order: 80,
    fields: [
      { slug: "landing.cta.headlineLine1", label: "כותרת — שורה 1" },
      { slug: "landing.cta.headlineLine2", label: "כותרת — שורה 2" },
      { slug: "landing.cta.subheadline", label: "פסקת משנה" },
      { slug: "landing.cta.button", label: "כפתור שליחה" },
      { slug: "landing.cta.note", label: "הערה מתחת לטופס" },
      {
        slug: "auth.emailLabel",
        label: "תווית שדה אימייל בטופס",
        hint: "מפתח auth — לא landing, אך מוצג בדף הנחיתה",
      },
    ],
  },
  {
    id: "schema",
    title: "Schema.org (JSON-LD, לא גלוי במסך)",
    order: 90,
    fields: [
      { slug: "landing.schema.howToTitle", label: "HowTo — כותרת" },
      { slug: "landing.schema.howToDescription", label: "HowTo — תיאור" },
      { slug: "landing.schema.step1Name", label: "HowTo שלב 1 — שם" },
      { slug: "landing.schema.step1Text", label: "HowTo שלב 1 — טקסט" },
      { slug: "landing.schema.step2Name", label: "HowTo שלב 2 — שם" },
      { slug: "landing.schema.step2Text", label: "HowTo שלב 2 — טקסט" },
      { slug: "landing.schema.step3Name", label: "HowTo שלב 3 — שם" },
      { slug: "landing.schema.step3Text", label: "HowTo שלב 3 — טקסט" },
      { slug: "landing.schema.instructorMentor", label: "Person — מנטור" },
    ],
  },
];

/** Hardcoded strings not yet in i18n — keyed by full slug. */
export const LANDING_COPY_STATIC_VALUES: Record<string, string> = {
  "landing.experience.scrollHint": "גללי לאט — כל כרטיס נפתח בזמן",
};

export function allLandingCopyFields(): LandingCopyFieldDef[] {
  return LANDING_COPY_SECTIONS.flatMap((s) => s.fields);
}
