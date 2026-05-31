/**
 * Every user-visible string on the marketing landing page (scroll + navbar + footer + popups).
 * Slugs are stable keys for importing edits back into the codebase.
 */

import { FALLBACK_PLANS } from "$lib/features/subscriptions/plansCatalog";

export const LANDING_COPY_FORMAT = "homebody-landing-copy/v2";

export type LandingCopyFieldDef = {
  slug: string;
  /** What your editor sees — plain Hebrew, no jargon */
  label: string;
};

export type LandingCopySectionDef = {
  id: string;
  title: string;
  order: number;
  fields: LandingCopyFieldDef[];
};

const faqFields = (): LandingCopyFieldDef[] => {
  const items: LandingCopyFieldDef[] = [{ slug: "landing.faq.headline", label: "כותרת המדור" }];
  for (let i = 1; i <= 7; i++) {
    items.push(
      { slug: `landing.faq.q${i}`, label: `שאלה ${i}` },
      { slug: `landing.faq.a${i}`, label: `תשובה ${i}` },
    );
  }
  return items;
};

const planFields = (): LandingCopyFieldDef[] => {
  const fields: LandingCopyFieldDef[] = [];
  for (const plan of FALLBACK_PLANS) {
    fields.push(
      { slug: `landing.plans.${plan.slug}.name`, label: `שם המסלול «${plan.nameHe}»` },
      {
        slug: `landing.plans.${plan.slug}.description`,
        label: `תיאור קצר למסלול «${plan.nameHe}»`,
      },
    );
  }
  return fields;
};

export const LANDING_COPY_SECTIONS: LandingCopySectionDef[] = [
  {
    id: "site",
    title: "שם האתר ותיאור כללי",
    order: 0,
    fields: [
      { slug: "site.name", label: "שם המותג (נגישות, כותרות, SEO)" },
      { slug: "site.tagline", label: "סלוגן קצר" },
      { slug: "site.description", label: "תיאור האתר (משפט אחד)" },
      { slug: "seo.site.description", label: "תיאור לגוגל (מטא — יכול להיות ארוך יותר)" },
      { slug: "seo.site.keywords", label: "מילות מפתח לגוגל (מופרדות בפסיקים)" },
    ],
  },
  {
    id: "navbar",
    title: "תפריט למעלה",
    order: 10,
    fields: [
      { slug: "nav.library", label: "קישור «ספריית שיעורים»" },
      { slug: "nav.login", label: "כפתור «כניסה» (לפני התחברות)" },
      { slug: "nav.dashboard", label: "כפתור «אזור אישי» (אחרי התחברות)" },
      { slug: "chrome.theme.light", label: "כפתור מעבר למצב בהיר (לנגישות)" },
      { slug: "chrome.theme.dark", label: "כפתור מעבר למצב כהה" },
    ],
  },
  {
    id: "hero",
    title: "פתיחה — המסך הראשון",
    order: 20,
    fields: [
      { slug: "landing.hero.headlineBefore", label: "כותרת גדולה — התחלה (לפני המילים המודגשות)" },
      { slug: "landing.hero.headlineAccent", label: "כותרת גדולה — המילים המודגשות" },
      { slug: "landing.hero.headlineAfter", label: "כותרת גדולה — סוף" },
      { slug: "landing.hero.eyebrow", label: "שורה קטנה מעל הכותרת" },
      { slug: "landing.hero.subhead", label: "משפט משנה מתחת לכותרת" },
      { slug: "landing.hero.lead", label: "משפט מתחת לכותרת (מסך שני)" },
      { slug: "landing.hero.ctaPrimary", label: "כפתור ראשי" },
      { slug: "landing.hero.ctaSecondary", label: "כפתור משני («המאמנת שלך»)" },
      { slug: "landing.hero.note", label: "שורה קטנה מתחת לכפתורים" },
      { slug: "landing.hero.scrollHint", label: "רמז «גללי למטה»" },
    ],
  },
  {
    id: "about",
    title: "על יובל — הביוגרפיה והסיפור",
    order: 30,
    fields: [
      { slug: "landing.instructor.sectionEyebrow", label: "שורה קטנה מעל השם" },
      { slug: "landing.instructor.sectionHeadline", label: "שם בכותרת המדור" },
      { slug: "landing.instructor.name", label: "שם מלא (גם למנועי חיפוש)" },
      { slug: "landing.instructor.subtitle", label: "משפט תיאור תחת השם" },
      { slug: "landing.instructor.storyOrigin1", label: "הסיפור — פסקה ראשונה" },
      { slug: "landing.instructor.storyOrigin2", label: "הסיפור — פסקה שנייה" },
      { slug: "landing.instructor.storyClosing", label: "פסקת סיכום (מודגשת)" },
      { slug: "landing.images.aboutAlt", label: "תיאור התמונה (לנגישות)" },
    ],
  },
  {
    id: "steps",
    title: "איך מתחילים — 3 צעדים",
    order: 50,
    fields: [
      { slug: "landing.steps.headline", label: "כותרת המדור" },
      { slug: "landing.steps.lead", label: "פסקת פתיחה" },
      { slug: "landing.steps.step1Title", label: "שלב 1 — כותרת" },
      { slug: "landing.steps.step1Desc", label: "שלב 1 — הסבר" },
      { slug: "landing.steps.step2Title", label: "שלב 2 — כותרת" },
      { slug: "landing.steps.step2Desc", label: "שלב 2 — הסבר" },
      { slug: "landing.steps.step3Title", label: "שלב 3 — כותרת" },
      { slug: "landing.steps.step3Desc", label: "שלב 3 — הסבר" },
      { slug: "landing.steps.step4Title", label: "שלב 4 — כותרת" },
      { slug: "landing.steps.step4Desc", label: "שלב 4 — הסבר" },
    ],
  },
  {
    id: "pricing",
    title: "מחירים ומסלולים",
    order: 70,
    fields: [
      { slug: "landing.pricing.headline", label: "כותרת המדור" },
      { slug: "landing.pricing.lead", label: "משפט מבוא" },
      { slug: "landing.pricing.featuredBadge", label: "תג על המסלול המומלץ" },
      { slug: "landing.pricing.perMonth", label: "טקסט ליד המחיר (למשל «₪/חודש»)" },
      { slug: "landing.pricing.ctaButton", label: "כפתור «בוחרים מסלול»" },
      { slug: "landing.pricing.guarantee", label: "שורה בתחתית (ביטול / הקפאה)" },
      { slug: "landing.pricing.planNoteFallback", label: "תיאור גיבוי אם חסר מהשרת" },
      ...planFields(),
      { slug: "landing.pricing.ui.loading", label: "בזמן טעינה: «טוענים מסלולים…»" },
      { slug: "landing.pricing.ui.errorLoad", label: "שגיאת חיבור לשרת" },
      { slug: "landing.pricing.ui.fallbackNotice", label: "הודעה: מחירים להמחשה" },
      { slug: "landing.pricing.ui.noPlans", label: "אין מסלולים להצגה" },
    ],
  },
  {
    id: "faq",
    title: "שאלות שכדאי לדעת",
    order: 80,
    fields: faqFields(),
  },
  {
    id: "cta",
    title: "הצטרפות — טופס בסוף העמוד",
    order: 90,
    fields: [
      { slug: "landing.cta.headlineLine1", label: "כותרת — שורה ראשונה" },
      { slug: "landing.cta.headlineLine2", label: "כותרת — שורה שנייה" },
      { slug: "landing.cta.subheadline", label: "משפט מתחת לכותרת" },
      { slug: "auth.emailLabel", label: "שדה אימייל (תווית + placeholder)" },
      { slug: "landing.cta.button", label: "כפתור שליחה" },
      { slug: "landing.cta.note", label: "שורה קטנה מתחת לטופס" },
    ],
  },
  {
    id: "footer",
    title: "תחתית העמוד",
    order: 100,
    fields: [
      { slug: "landing.footer.linkHome", label: "קישור: דף הבית" },
      { slug: "landing.footer.linkConcept", label: "קישור: רעיון Spine" },
      { slug: "landing.footer.linkTerms", label: "קישור: תנאי שימוש" },
      { slug: "landing.footer.linkPrivacy", label: "קישור: פרטיות" },
      { slug: "landing.footer.linkCancellations", label: "קישור: ביטולים" },
      { slug: "landing.footer.linkAccessibility", label: "קישור: נגישות" },
      { slug: "landing.footer.linkHealth", label: "קישור: הצהרת בריאות" },
    ],
  },
  {
    id: "auth",
    title: "חלון כניסה (נפתח בלחיצה על «כניסה»)",
    order: 110,
    fields: [
      { slug: "auth.title", label: "כותרת החלון" },
      { slug: "auth.intro", label: "משפט הסבר" },
      { slug: "auth.submitSendCode", label: "כפתור שליחת קוד" },
      { slug: "auth.codeStepTitle", label: "כותרת אחרי שליחת קוד" },
      { slug: "auth.codeLabel", label: "שדה קוד" },
      { slug: "auth.submitEnter", label: "כפתור כניסה" },
      { slug: "auth.statusCodeSent", label: "הודעה: הקוד נשלח" },
      { slug: "auth.statusCodeError", label: "הודעה: קוד שגוי" },
      { slug: "auth.switchEmail", label: "קישור «אימייל אחר»" },
      { slug: "auth.validation.emailRequired", label: "שגיאה: חסר אימייל" },
    ],
  },
  {
    id: "subscription",
    title: "חלון בחירת מסלול (נפתח ממחירים)",
    order: 120,
    fields: [
      { slug: "overlay.subscription.title", label: "כותרת החלון" },
      { slug: "overlay.subscription.description", label: "הסבר מתחת לכותרת" },
      { slug: "overlay.subscription.instructorNotice", label: "הודעה למדריכות" },
      { slug: "overlay.subscription.loading", label: "טוענים מסלולים…" },
      { slug: "overlay.subscription.noPlans", label: "אין מסלולים" },
      { slug: "overlay.subscription.close", label: "כפתור סגירה" },
    ],
  },
  {
    id: "seo-page",
    title: "כותרת הדף בגוגל (מטא)",
    order: 130,
    fields: [
      { slug: "landing.seo.pageTitle", label: "כותרת הטאב בדפדפן" },
      { slug: "landing.seo.pageDescription", label: "תיאור שמופיע בגוגל" },
    ],
  },
];

/** Strings not in i18n yet — keyed by slug. */
export const LANDING_COPY_STATIC_VALUES: Record<string, string> = {
  "seo.site.description":
    "פילאטיס שיקומי בבית, טיפול פתולוגיות בעזרת תנועה. פילאטיס קלאסי לכל הרמות.",
  "seo.site.keywords":
    "פילאטיס אונליין, שיעורי פילאטיס אונליין, פילאטיס שיקומי, פילאטיס לכאבי גב, פילאטיס בבית, פילאטיס בעברית, שיעורים חיים פילאטיס, פילאטיס פרטי אונליין, פילאטיס לכתף קפואה, פילאטיס לברכיים, פילאטיס אחרי ניתוח, פילאטיס רפואי, פילאטיס קליני, פילאטיס עם מגבלות, פילאטיס לנשים, שיעור פילאטיס בזום, Pilates online Israel, Online pilates Hebrew, Rehabilitative pilates online, פילאטיס קלאסי",
  "chrome.theme.light": "מעבר למצב בהיר",
  "chrome.theme.dark": "מעבר למצב כהה",
  "landing.footer.linkHome": "דף הבית",
  "landing.footer.linkConcept": "רעיון Spine",
  "landing.footer.linkTerms": "תנאי שימוש",
  "landing.footer.linkPrivacy": "פרטיות",
  "landing.footer.linkCancellations": "ביטולים",
  "landing.footer.linkAccessibility": "נגישות",
  "landing.footer.linkHealth": "הצהרת בריאות",
  "landing.pricing.ui.loading": "טוענים מסלולים…",
  "landing.pricing.ui.errorLoad":
    "לא הצלחנו לטעון מחירים מהשרת. בדקו ש־Convex מחובר (PUBLIC_CONVEX_CLIENT_URL).",
  "landing.pricing.ui.fallbackNotice": "מחירים להמחשה — חיבור לשרת לא זמין כרגע.",
  "landing.pricing.ui.noPlans": "אין מסלולים להצגה כרגע.",
  "overlay.subscription.title": "בחרו מסלול",
  "overlay.subscription.description":
    "כל מסלול עם אופי משלו — ככל שהמסלול עשיר יותר, החוויה מורגשת יותר. שדרוג דורש תשלום; הורדת מסלול מתוזמנת לחידוש הבא.",
  "overlay.subscription.instructorNotice":
    "מנוי בתשלום מיועד למנויות בלבד. מדריכות משתמשות בלוח הבקרה המקצועי.",
  "overlay.subscription.loading": "טוענים מסלולים…",
  "overlay.subscription.noPlans": "אין מסלולים זמינים כרגע.",
  "overlay.subscription.close": "סגירה",
};

export function allLandingCopyFields(): LandingCopyFieldDef[] {
  return LANDING_COPY_SECTIONS.flatMap((s) => s.fields);
}
