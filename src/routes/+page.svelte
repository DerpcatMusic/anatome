<script lang="ts">
  import { onMount } from "svelte";
  import { Dialog } from "bits-ui";
  import "$lib/features/landing/landing.css";
  import SEO from "$components/seo/SEO.svelte";
  import { SITE } from "$lib/seo/config";
  import {
    schemaGraph,
    websiteSchema,
    organizationSchema,
    localBusinessSchema,
    offerCatalogSchema,
    courseSchema,
    faqPageSchema,
    howToSchema,
    medicalWebPageSchema,
    personSchema,
    breadcrumbSchema,
  } from "$lib/seo/schema";
  import AuthPanel from "$features/auth/components/AuthPanel.svelte";
  import Footer from "$components/layout/Footer.svelte";
  import {
    HeroSection,
    PhilosophySection,
    InstructorSection,
    PreviewSection,
    PillarsSection,
    StepsSection,
    PricingSection,
    FAQSection,
    CTASection,
  } from "$lib/features/landing/components";
  import { useI18n } from "$lib/i18n/runes";

  const { t } = useI18n();
  let authOpen = $state(false);

  /* ═══════════════════════════════════════════
     FILL IN: Real instructor details
     ═══════════════════════════════════════════ */
  const INSTRUCTOR = {
    name: "[שם המדריכה]",
    years: "X",
    story:
      "[סיפור אישי קצר — למה התחלת ללמד פילאטיס, מה הוביל אותך לפתוח HomeBody, איך הירושה ממרתה פילאטיס מעצבת את השיטה שלך. 2-3 משפטים אמיתיים.]",
  };

  function openAuthOverlay() {
    authOpen = true;
  }

  onMount(() => {
    const open = () => { authOpen = true; };
    const close = () => { authOpen = false; };
    window.addEventListener("homebody:auth-open", open);
    window.addEventListener("homebody:auth-close", close);
    return () => {
      window.removeEventListener("homebody:auth-open", open);
      window.removeEventListener("homebody:auth-close", close);
    };
  });

  /* ─── Structured Data (honest — no fake reviews) ─── */
  const pageUrl = SITE.domain;
  const today = new Date().toISOString().split("T")[0];

  const faqItems = [
    {
      question: "אני מתחילה לגמרי — זה מתאים לי?",
      answer:
        "לגמרי. יש שיעורי מבוא שמסבירים את הבסיס — איך לנשום, איך להפעיל את ליבת הגוף, איך להתאים כל תרגיל לרמה שלך. אם יש לך מגבלה פיזית ספציפית (דיסק, כתף קפואה, כאבי ברכיים), תמיד אפשר לשאול לפני השיעור איזה תרגילים להימנע מהם.",
    },
    {
      question: "האם השיעורים מתאימים לכאבי גב / דיסק / כתף קפואה?",
      answer:
        `כן — זה בדיוק התמחות שלנו. כל שיעור מלווה בהסברים על איזה תרגיל מתאים לאיזו פתולוגיה, ומה לעשות אם משהו כואב. אנחנו לא עושים "תעשי איתי" בלי הסבר. אם יש לך אבחון רפואי ספציפי, מומלץ לשלוח אותו לפני השיעור הראשון כדי שהמדריכה תוכל להתאים את התוכנית.`,
    },
    {
      question: "מה ההבדל בין מקרופלואו למיקרופלואו?",
      answer:
        "מקרופלואו — סרטוני פילאטיס פלואו שלם בין חצי שעה לשעה. כל סרטון עולה קרדיט אחד ונשאר אצלך לתמיד, גם אחרי שאת כבר לא רשומה. מיקרופלואו — סרטונים קצרים של תרגיל או שניים, מתמקדים על שריר או גיד או פטולוגיה אחת. זמין לכל מי שמשלם מנוי. כשמפסיקים להיות רשומים — אין גישה אליהם יותר.",
    },
    {
      question: "איך עובד הלייב? זום? גוגל מיט?",
      answer:
        "בכלל לא. הכל בפלטפורמה שלנו. נרשמת? את כבר בפנים. בלי להסתבך עם אימייל וקישורים ובלאגן. שיעורים קבוצתיים בלייב — אנחנו רואים אותם, הם רואים אותנו, והמדריכה נותנת תיקונים בזמן אמת. יש גם אפשרות לאחד על אחד.",
    },
    {
      question: "איזה ציוד אני צריכה?",
      answer:
        "רק מזרן. אין צורך בציוד מקצועי או בסטודיו יקר. חלק מהשיעורים משתמשים בחפצים פשוטים מהבית — כרית, מגבת מגולגלת, כדור טניס. כל מה שצריך מופיע בתיאור השיעור לפני שמתחילים.",
    },
    {
      question: "איך עובד השיעור הפרטי?",
      answer:
        "תואמים זמן דרך המערכת, מתחברים בווידאו, והמדריכה בונה שיעור מותאם אישית — על בסיס אבחון קצר שתמלאי לפני השיעור. אחרי השיעור תקבלי תכנית עבודה אישית עם תרגילים לשבוע הקרוב.",
    },
    {
      question: "איך נראית הגרפיקה האנטומית בפועל?",
      answer:
        "בכל שיעור מוקלט מופיעים חצים ותוויות על גבי הסרטון שמראים בדיוק איזו שריר מופעל באותו רגע. אם התרגיל מיועד לדיסק צווארי — תראי בדיוק איזה חלק בגוף עובד ולמה. זה לא אנטומיה גנרית — זה מותאם לתרגיל הספציפי.",
    },
  ];

  const howToSteps = [
    {
      position: 1,
      name: t.landing.schema.step1Name(),
      text: t.landing.schema.step1Text(),
    },
    {
      position: 2,
      name: t.landing.schema.step2Name(),
      text: t.landing.schema.step2Text(),
    },
    {
      position: 3,
      name: t.landing.schema.step3Name(),
      text: t.landing.schema.step3Text(),
    },
  ];

  const jsonLd = schemaGraph(
    websiteSchema(),
    organizationSchema(),
    localBusinessSchema(),
    offerCatalogSchema(),
    courseSchema(),
    faqPageSchema(faqItems),
    howToSchema(t.landing.schema.howToTitle(), t.landing.schema.howToDescription(), howToSteps),
    medicalWebPageSchema(
      t.landing.seo.pageTitle(),
      SITE.description,
      pageUrl,
      today
    ),
    personSchema(
      INSTRUCTOR.name,
      INSTRUCTOR.story,
      t.landing.instructor.subtitle(),
      t.landing.schema.instructorMentor()
    ),
    breadcrumbSchema([{ name: t.landing.seo.breadcrumbHome(), url: SITE.domain }])
  );
</script>

<SEO
  title={t.landing.seo.pageTitle()}
  description={t.landing.seo.pageDescription()}
  keywords={SITE.keywords}
  ogType="website"
  canonical={SITE.domain}
  jsonLd={jsonLd}
  breadcrumbs={[{ name: t.landing.seo.breadcrumbHome(), url: SITE.domain }]}
/>

<main class="landing" id="main-content">
  <HeroSection {openAuthOverlay} />
  <PhilosophySection />
  <InstructorSection instructor={INSTRUCTOR} />
  <PreviewSection />
  <PillarsSection />
  <StepsSection />
  <PricingSection {openAuthOverlay} />
  <FAQSection items={faqItems} />
  <CTASection {openAuthOverlay} />
</main>

<Footer />

<Dialog.Root bind:open={authOpen}>
  <Dialog.Portal>
    <Dialog.Overlay class="auth-overlay" />
    <Dialog.Content class="auth-card" aria-label="כניסה והרשמה">
      <AuthPanel />
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
