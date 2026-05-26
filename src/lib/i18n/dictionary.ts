export type Locale = "he";

export const defaultLocale: Locale = "he";

export type TranslationKey =
  | "site.name"
  | "site.tagline"
  | "site.description"
  | "nav.login"
  | "nav.logout"
  | "nav.dashboard"
  | "nav.backHome"
  | "nav.onboarding"
  | "hero.eyebrow"
  | "hero.headline"
  | "hero.lead"
  | "hero.cta.start"
  | "hero.cta.howItWorks"
  | "features.title"
  | "features.subtitle"
  | "features.freedom.title"
  | "features.freedom.desc"
  | "features.smart.title"
  | "features.smart.desc"
  | "features.live.title"
  | "features.live.desc"
  | "cta.title"
  | "cta.subtitle"
  | "cta.button"
  | "auth.title"
  | "auth.email.stepTitle"
  | "auth.code.stepTitle"
  | "auth.emailLabel"
  | "auth.codeLabel"
  | "auth.submit.sendCode"
  | "auth.submit.enter"
  | "auth.pending"
  | "auth.status.codeSent"
  | "auth.status.error"
  | "auth.switchEmail"
  | "auth.intro"
  | "auth.loggedIn.title"
  | "auth.loggedIn.subtitle"
  | "auth.loggedIn.cta"
  | "auth.loading"
  | "onboarding.step"
  | "onboarding.stepCount"
  | "onboarding.experience.title"
  | "onboarding.experience.subtitle"
  | "onboarding.experience.new.title"
  | "onboarding.experience.new.desc"
  | "onboarding.experience.some.title"
  | "onboarding.experience.some.desc"
  | "onboarding.experience.steady.title"
  | "onboarding.experience.steady.desc"
  | "onboarding.equipment.title"
  | "onboarding.equipment.subtitle"
  | "onboarding.equipment.emptyWarning"
  | "onboarding.goals.title"
  | "onboarding.goals.subtitle"
  | "onboarding.goals.emptyWarning"
  | "onboarding.notes.title"
  | "onboarding.notes.subtitle"
  | "onboarding.notes.placeholder"
  | "onboarding.summary.title"
  | "onboarding.summary.experience"
  | "onboarding.summary.equipment"
  | "onboarding.summary.goals"
  | "onboarding.nav.back"
  | "onboarding.nav.next"
  | "onboarding.nav.submit"
  | "onboarding.nav.submitPending"
  | "onboarding.success.title"
  | "onboarding.success.subtitle"
  | "onboarding.success.loading"
  | "onboarding.locked.title"
  | "onboarding.locked.subtitle"
  | "onboarding.locked.cta"
  | "onboarding.error"
  | "dashboard.title"
  | "dashboard.kicker"
  | "dashboard.nav.overview"
  | "dashboard.nav.profile"
  | "dashboard.nav.video"
  | "dashboard.nav.lives"
  | "dashboard.nav.subscription"
  | "dashboard.nav.comingSoon"
  | "dashboard.welcome.title"
  | "dashboard.welcome.subtitle"
  | "dashboard.profile.equipment"
  | "dashboard.profile.experience"
  | "dashboard.profile.goals"
  | "dashboard.profile.notes"
  | "dashboard.profile.notesEmpty"
  | "dashboard.profile.edit"
  | "app.loading"
  | "app.error"
  | "app.error.retry"
  | "app.locked.title"
  | "app.locked.subtitle"
  | "app.locked.cta"
  | "app.needsOnboarding.title"
  | "app.needsOnboarding.subtitle"
  | "app.needsOnboarding.cta"
  | "misc.close"
  | "misc.and"
  | "misc.or"
  | "misc.loading"
  | "misc.charCount";

type Dictionary = Record<Locale, Record<TranslationKey, string>>;

export const dictionary: Dictionary = {
  he: {
    "site.name": "AnatoMe",
    "site.tagline": "פילאטיס שיקומי בבית",
    "site.description": "שיעורי פילאטיס שיקומי אונליין בעברית. חיבור עמוק לגוף, שיקום מפציעות וחיזוק בלי רעש ובלי לחץ. תנועה בריאה שעובדת בשבילך.",
    "nav.login": "כניסה",
    "nav.logout": "יציאה",
    "nav.dashboard": "אזור אישי",
    "nav.backHome": "לעמוד הראשי",
    "nav.onboarding": "התאמה אישית",
    "hero.eyebrow": "AnatoMe — פילאטיס שיקומי מדויק",
    "hero.headline": "הפלטפורמה היחידה שלא מוכרת לך סרטוני יוטיוב גנריים.",
    "hero.lead": "הרשת מוצפת באימונים גנריים של \"מלצריות פילאטיס\" שמחפשות כסף קל ובמלכות אינסטגרם שלא מבינות אנטומיה. הגוף שלך לא צריך פילטרים, הוא צריך הבנה אנטומית עמוקה. כאן יובל דלל מביאה פילאטיס שיקומי אמיתי ומקצועי בעברית, המותאם אישית לשיקום פציעות, פתולוגיות, הריון או כאבים כרוניים — כדי לשפר את היציבות ואת חיי היומיום שלך באמת, ללא בולשיט.",
    "hero.cta.start": "התחילי עכשיו — שיעור ראשון בחינם",
    "hero.cta.howItWorks": "איך זה עובד",
    "features.title": "למה AnatoMe?",
    "features.subtitle": "פילאטיס שמבין שגוף אמיתי מתמודד לפעמים עם מגבלות וכאבים. וזה בסדר גמור.",
    "features.freedom.title": "חופש מוחלט",
    "features.freedom.desc": "שיעורים מוקלטים בקצב שלך. מתאמנות מתי שרוצות ומאיפה שרוצות, בלי להתחייב לשעות קבועות או לפקקים בדרך לסטודיו.",
    "features.smart.title": "שיקומי וחכם",
    "features.smart.desc": "פילאטיס לאנשים עם גוף אמיתי: כאבים, פציעות, פריצות דיסק, אוסטאופורוזיס או שיקום אחרי לידה. כל תנועה מוסברת ומותאמת אנטומית.",
    "features.live.title": "שיעור תיקון חי",
    "features.live.desc": "שיעורי לייב בקבוצות קטנות. המדריכה רואה אותך דרך המסך ומתקנת את התנועה שלך בזמן אמת, ממש כאילו היא איתך בחדר.",
    "cta.title": "מוכנה להתחיל?",
    "cta.subtitle": "השיעור הראשון עלינו. בלי כרטיס אשראי, בלי התחייבות, בלי סיפורים.",
    "cta.button": "תני לי את השיעור הראשון",
    "auth.title": "גישה לחברים",
    "auth.email.stepTitle": "כניסה או הרשמה",
    "auth.code.stepTitle": "הזיני את קוד ה-OTP",
    "auth.emailLabel": "אימייל",
    "auth.codeLabel": "קוד בן 6 ספרות",
    "auth.submit.sendCode": "שלחו לי קוד 6 ספרות",
    "auth.submit.enter": "להיכנס",
    "auth.pending": "רגע...",
    "auth.status.codeSent": "שלחנו קוד חד־פעמי בן 6 ספרות לאימייל שלך. בדקי גם בתיקיית הספאם.",
    "auth.status.error": "לא הצלחנו להתחבר כרגע. נסי שוב בעוד רגע.",
    "auth.switchEmail": "להשתמש באימייל אחר",
    "auth.intro": "מכניסים כתובת אימייל ומקבלים קוד OTP חד־פעמי. אין צורך בסיסמה.",
    "auth.loggedIn.title": "החשבון פתוח",
    "auth.loggedIn.subtitle": "אפשר להמשיך לאזור האישי או לצאת.",
    "auth.loggedIn.cta": "לאזור האישי",
    "auth.loading": "בודקים חשבון...",
    "onboarding.step": "שלב",
    "onboarding.stepCount": "מתוך 4",
    "onboarding.experience.title": "כמה ניסיון יש לך בפילאטיס?",
    "onboarding.experience.subtitle": "",
    "onboarding.experience.new.title": "חדשה לגמרי",
    "onboarding.experience.new.desc": "",
    "onboarding.experience.some.title": "קצת ניסיון",
    "onboarding.experience.some.desc": "",
    "onboarding.experience.steady.title": "מתרגלת קבועה",
    "onboarding.experience.steady.desc": "",
    "onboarding.equipment.title": "מה יש לך בבית?",
    "onboarding.equipment.subtitle": "",
    "onboarding.equipment.emptyWarning": "בחרי לפחות פריט אחד.",
    "onboarding.goals.title": "מה המטרות שלך?",
    "onboarding.goals.subtitle": "",
    "onboarding.goals.emptyWarning": "בחרי לפחות מטרה אחת.",
    "onboarding.notes.title": "משהו שחשוב שנדע?",
    "onboarding.notes.subtitle": "אופציונלי.",
    "onboarding.notes.placeholder": "כאבים, מגבלות, העדפות…",
    "onboarding.summary.title": "סיכום ההתאמה",
    "onboarding.summary.experience": "ניסיון",
    "onboarding.summary.equipment": "ציוד",
    "onboarding.summary.goals": "מטרות",
    "onboarding.nav.back": "← חזרה",
    "onboarding.nav.next": "המשך →",
    "onboarding.nav.submit": "לשמור ולהתחיל",
    "onboarding.nav.submitPending": "שומרים...",
    "onboarding.success.title": "ההתאמה נשמרה",
    "onboarding.success.subtitle": "מעבירים אותך לאזור האישי...",
    "onboarding.success.loading": "מעבירים אותך לאזור האישי...",
    "onboarding.locked.title": "צריך להתחבר קודם",
    "onboarding.locked.subtitle": "כדי להתחיל את ההתאמה האישית, נכנסים עם כתובת אימייל.",
    "onboarding.locked.cta": "לעמוד הראשי",
    "onboarding.error": "לא הצלחנו לטעון אונבורדינג.",
    "dashboard.title": "סקירה",
    "dashboard.kicker": "AnatoMe",
    "dashboard.nav.overview": "סקירה",
    "dashboard.nav.profile": "הפרופיל שלי",
    "dashboard.nav.video": "וידאו",
    "dashboard.nav.lives": "לייבים",
    "dashboard.nav.subscription": "מנוי",
    "dashboard.nav.comingSoon": "בקרוב",
    "dashboard.welcome.title": "ברוכה הבאה",
    "dashboard.welcome.subtitle": "שיעורים, לייבים וקרדיטים — כאן.",
    "dashboard.profile.equipment": "ציוד",
    "dashboard.profile.experience": "ניסיון",
    "dashboard.profile.goals": "מטרות",
    "dashboard.profile.notes": "הערות",
    "dashboard.profile.notesEmpty": "אין",
    "dashboard.profile.edit": "עריכה",
    "app.loading": "טוען...",
    "app.error": "לא הצלחנו לטעון.",
    "app.error.retry": "שוב",
    "app.locked.title": "צריך להתחבר",
    "app.locked.subtitle": "נכנסים מהעמוד הראשי.",
    "app.locked.cta": "כניסה",
    "app.needsOnboarding.title": "התאמה אישית",
    "app.needsOnboarding.subtitle": "דקה אחת לפני שמתחילים.",
    "app.needsOnboarding.cta": "להמשיך",
    "misc.close": "סגירה",
    "misc.and": "ו",
    "misc.or": "או",
    "misc.loading": "טוען...",
    "misc.charCount": "{count}/600",
  },
};

export function t(key: TranslationKey, locale: Locale = defaultLocale): string {
  return dictionary[locale][key] ?? key;
}

export function tFormat(key: TranslationKey, values: Record<string, string | number>, locale: Locale = defaultLocale): string {
  let str = t(key, locale);
  for (const [k, v] of Object.entries(values)) {
    str = str.replace(`{${k}}`, String(v));
  }
  return str;
}
