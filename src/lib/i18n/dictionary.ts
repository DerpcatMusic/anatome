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
    "site.name": "HomeBody",
    "site.tagline": "פילאטיס בבית",
    "site.description": "פילאטיס אונליין בעברית, חי ומוקלט, בלי רעש. שיעורי פילאטיס שיקומי לגוף אמיתי.",
    "nav.login": "כניסה",
    "nav.logout": "יציאה",
    "nav.dashboard": "אזור אישי",
    "nav.backHome": "לעמוד הראשי",
    "nav.onboarding": "התאמה אישית",
    "hero.eyebrow": "HomeBody — פילאטיס שיקומי בבית",
    "hero.headline": "הגוף שלך deserves קצת אהבה.",
    "hero.lead": "שיעורי פילאטיס נקיים, חיים ומוקלטים, בעברית, לגוף אמיתי עם כאבים, מגבלות ורצון לחזור לתנועה. בלי לחץ. בלי רעש. רק את והמזרן.",
    "hero.cta.start": "התחילי עכשיו — שיעור ראשון בחינם",
    "hero.cta.howItWorks": "איך זה עובד",
    "features.title": "למה HomeBody?",
    "features.subtitle": "פילאטיס שמבין שגוף אמיתי לא תמיד מת cooperating. וזה בסדר גמור.",
    "features.freedom.title": "חופש מוחלט",
    "features.freedom.desc": "שיעורים מוקלטים לפי מנוי וקרדיטים. צופים בזמן שמתאים לך, בלי להתחייב לשעה קבועה. בוקר, צהריים, לילה — הגוף קובע.",
    "features.smart.title": "שיקומי וחכם",
    "features.smart.desc": "פילאטיס לאנשים עם גוף אמיתי: כאבים, מגבלות, חזרה לתנועה, וחיזוק בלי לחץ. כל שיעור מותאם לרמתך ולציוד שיש בבית.",
    "features.live.title": "שיעור תיקון חי",
    "features.live.desc": "עד 12 משתתפים. המדריכה רואה את כולם, מצמידה משתתף אחד למסך גדול, ומתקנת בזמן אמת. כאילו יש איתך בסטודיו.",
    "cta.title": "מוכנה להתחיל?",
    "cta.subtitle": "השיעור הראשון עלינו. בלי כרטיס אשראי, בלי התחייבות, בלי סיפורים.",
    "cta.button": "תני לי את השיעור הראשון",
    "auth.title": "גישה לחברים",
    "auth.email.stepTitle": "כניסה או הרשמה",
    "auth.code.stepTitle": "בדקי את האימייל",
    "auth.emailLabel": "אימייל",
    "auth.codeLabel": "קוד חד־פעמי",
    "auth.submit.sendCode": "שלחו לי קוד",
    "auth.submit.enter": "להיכנס",
    "auth.pending": "רגע...",
    "auth.status.codeSent": "שלחנו קוד כניסה לאימייל שלך. בדקי גם בתיקיית הספאם.",
    "auth.status.error": "לא הצלחנו להתחבר כרגע. נסי שוב בעוד רגע.",
    "auth.switchEmail": "להשתמש באימייל אחר",
    "auth.intro": "מכניסים כתובת אימייל ומקבלים קוד חד־פעמי. אין צורך בסיסמה.",
    "auth.loggedIn.title": "החשבון פתוח",
    "auth.loggedIn.subtitle": "אפשר להמשיך לאזור האישי או לצאת.",
    "auth.loggedIn.cta": "לאזור האישי",
    "auth.loading": "בודקים חשבון...",
    "onboarding.step": "שלב",
    "onboarding.stepCount": "מתוך 4",
    "onboarding.experience.title": "כמה ניסיון יש לך בפילאטיס?",
    "onboarding.experience.subtitle": "נתחיל ממשהו פשוט. אין תשובה לא נכונה.",
    "onboarding.experience.new.title": "חדשה לגמרי",
    "onboarding.experience.new.desc": "מעולם לא עשיתי פילאטיס, או שזה נשמע לי כמו שפה זרה",
    "onboarding.experience.some.title": "יש קצת ניסיון",
    "onboarding.experience.some.desc": "עשיתי כמה שיעורים פה ושם, אני מכירה את הבסיס",
    "onboarding.experience.steady.title": "מתרגלת קבועה",
    "onboarding.experience.steady.desc": "פילאטיס הוא חלק משגרת השבוע שלי",
    "onboarding.equipment.title": "מה יש לך בבית?",
    "onboarding.equipment.subtitle": "נשתמש בזה כדי להציע שיעורים שמתאימים לציוד שלך.",
    "onboarding.equipment.emptyWarning": "בחרי לפחות פריט אחד כדי שנוכל להתאים שיעורים.",
    "onboarding.goals.title": "מה המטרה העיקרית?",
    "onboarding.goals.subtitle": "אפשר לבחור כמה — זו לא התחייבות, רק כיוון.",
    "onboarding.goals.emptyWarning": "בחרי לפחות מטרה אחת כדי שנוכל להתאים שיעורים.",
    "onboarding.notes.title": "משהו שחשוב לדעת?",
    "onboarding.notes.subtitle": "אופציונלי לחלוטין. המדריכה תראה את זה לפני השיעור הראשון.",
    "onboarding.notes.placeholder": "למשל: כאב גב תחתון, אחרי ניתוח קיסרי, מגבלות ברך, או העדפה לשיעורים קצרים...",
    "onboarding.summary.title": "סיכום ההתאמה",
    "onboarding.summary.experience": "ניסיון",
    "onboarding.summary.equipment": "ציוד",
    "onboarding.summary.goals": "מטרות",
    "onboarding.nav.back": "← חזרה",
    "onboarding.nav.next": "המשך →",
    "onboarding.nav.submit": "לשמור ולהתחיל ✦",
    "onboarding.nav.submitPending": "שומרים...",
    "onboarding.success.title": "ההתאמה נשמרה",
    "onboarding.success.subtitle": "מעבירים אותך לאזור האישי...",
    "onboarding.success.loading": "מעבירים אותך לאזור האישי...",
    "onboarding.locked.title": "צריך להתחבר קודם",
    "onboarding.locked.subtitle": "כדי להתחיל את ההתאמה האישית, נכנסים עם כתובת אימייל.",
    "onboarding.locked.cta": "לעמוד הראשי",
    "onboarding.error": "לא הצלחנו לטעון אונבורדינג.",
    "dashboard.title": "האזור האישי",
    "dashboard.kicker": "HomeBody",
    "dashboard.nav.overview": "סקירה",
    "dashboard.nav.profile": "פרופיל פילאטיס",
    "dashboard.nav.video": "וידאו",
    "dashboard.nav.lives": "לייבים",
    "dashboard.nav.subscription": "מנוי",
    "dashboard.nav.comingSoon": "בקרוב",
    "dashboard.welcome.title": "ברוכה הבאה",
    "dashboard.welcome.subtitle": "האזור האישי שלך מוכן. כאן יופיעו השיעורים, הלייבים והקרדיטים שלך.",
    "dashboard.profile.equipment": "ציוד",
    "dashboard.profile.experience": "ניסיון",
    "dashboard.profile.goals": "מטרות",
    "dashboard.profile.notes": "הערות",
    "dashboard.profile.notesEmpty": "אין",
    "dashboard.profile.edit": "עריכה",
    "app.loading": "טוען אזור אישי...",
    "app.error": "לא הצלחנו לטעון את החשבון.",
    "app.error.retry": "לנסות שוב",
    "app.locked.title": "צריך להתחבר",
    "app.locked.subtitle": "החשבון נעול. נכנסים מחדש דרך העמוד הראשי.",
    "app.locked.cta": "כניסה",
    "app.needsOnboarding.title": "כמעט שם",
    "app.needsOnboarding.subtitle": "צריך לסיים התאמה אישית קצרה לפני שמתחילים.",
    "app.needsOnboarding.cta": "להמשיך בהתאמה",
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
