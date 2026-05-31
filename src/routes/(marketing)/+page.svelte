<script lang="ts">
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
  import HeroBackground from "$lib/features/landing/components/HeroBackground.svelte";
  import { createHeroScrollActive } from "$lib/features/landing/lib/hero-scroll";
  import LandingFooter from "$lib/features/landing/components/LandingFooter.svelte";
  import {
    HeroSection,
    AboutSection,
    StepsSection,
    PricingSection,
    FAQSection,
    AiAnswerBox,
  } from "$lib/features/landing/components";
  import { useI18n } from "$lib/i18n/runes";
  import { openAuthOverlay } from "$lib/auth/open-overlay";
  import { Button } from "bits-ui";
  import { browser } from "$app/environment";
  const { t } = useI18n();
  let heroActive = $state(true);
  let ctaEmail = $state("");
  $effect(() => createHeroScrollActive((active) => {
    heroActive = active;
  }));
  let landingRoot = $state<HTMLElement | undefined>(undefined);
  $effect(() => {
    if (!browser || !landingRoot) return;
    let cleanup: (() => void) | undefined;
    void import("$lib/features/landing/lib/landing-scroll").then(({ initLandingScroll }) => {
      cleanup = initLandingScroll(landingRoot!);
    });
    return () => cleanup?.();
  });

  function makeInstructor(t: ReturnType<typeof useI18n>['t']) {
    return {
      name: t.landing.instructor.name(),
      story: t.landing.instructor.storyClosing(),
      subtitle: t.landing.instructor.subtitle(),
    };
  }

  const INSTRUCTOR = $derived(makeInstructor(t));

  function openSignupAuth() {
    const email = ctaEmail.trim().toLowerCase();
    if (!email) {
      openAuthOverlay();
      return;
    }
    openAuthOverlay({ email, autoSendCode: true });
  }

  const pageUrl = SITE.domain;
  const today = $derived(new Date().toISOString().split("T")[0]);

  function makeFaqItems(t: ReturnType<typeof useI18n>['t']) {
    return [
      { question: t.landing.faq.q1(), answer: t.landing.faq.a1() },
      { question: t.landing.faq.q2(), answer: t.landing.faq.a2() },
      { question: t.landing.faq.q3(), answer: t.landing.faq.a3() },
      { question: t.landing.faq.q4(), answer: t.landing.faq.a4() },
      { question: t.landing.faq.q5(), answer: t.landing.faq.a5() },
      { question: t.landing.faq.q6(), answer: t.landing.faq.a6() },
      { question: t.landing.faq.q7(), answer: t.landing.faq.a7() },
      // GEO-optimized additional FAQs for AI search citation
      {
        question: "האם פילאטיס אונליין באמת עובד כמו בסטודיו?",
        answer: "כן. המחקר מראה שפילאטיס קבוע משפר חוזק ליבה, יציבה ומפחית כאבי גב — בין אם מתרגלים בסטודיו או בבית. ב-AnatoMe השיעורים הלייב כוללים תיקון תנוחות בזמן אמת כמו בסטודיו, והשיעורים המוקלטים מאפשרים חזרה על כל תרגיל בקצב שלך. היתרון הגדול: אין צורך בנסיעה, חניה או התאמה ללוח זמנים של סטודיו.",
      },
      {
        question: "פילאטיס או יוגה — מה מתאים לנשים עם כאבי גב?",
        answer: "לנשים עם כאבי גב כרוניים, פריצת דיסק או פתולוגיות תנועתיות — פילאטיס שיקומי הוא הבחירה המדויקת יותר. בעוד שיוגה מתמקדת בגמישות והרפיה, פילאטיס שיקומי ב-AnatoMe מכוון אנטומית לחיזוק שרירי הליבה העמוקים, שיפור יציבה והפחתת עומס על עמוד השדרה. כל שיעור מלווה בהסברים על אילו שרירים עובדים ואיך הם תומכים בגב.",
      },
      {
        question: "כמה פעמים בשבוע כדאי לעשות פילאטיס אונליין?",
        answer: "מומלץ 2–3 פעמים בשבוע לתוצאות אופטימליות. מתחילות יכולות להתחיל עם שיעור אחד בשבוע ולהגביר בהדרגה. ב-AnatoMe יש שיעורים ממוקדים של 20 דקות לימים עמוסים, ושיעורי עומק של 40–60 דקות כשיש זמן. העקביות חשובה יותר מהמשך — גם 20 דקות פעמיים בשבוע יכולות ליצור שינוי משמעותי בכאבי גב וביציבה.",
      },
      {
        question: "פילאטיס אונליין לנשים אחרי לידה — מתי מתחילים?",
        answer: "לאחר לידה וגינלית ללא סיבוכים, אפשר להתחיל פילאטיס קל כבר לאחר 6 שבועות (או 8 שבועות אחרי ניתוח קיסרי). ב-AnatoMe יש מסלול שיקום רצפת אגן ספציפי לאמהות אחרי לידה, המלווה בתרגילים מדויקים לשחזור כוח הליבה, שיפור יציבה, והפחתת כאבי גב הנפוצים בתקופה זו. מומלץ להתייעץ עם רופא לפני תחילת אימון.",
      },
      {
        question: "פילאטיס לנשים בהריון — האם זה בטוח?",
        answer: "פילאטיס הוא אחד האימונים הבטוחים והמומלצים ביותר בהריון, בתנאי שהוא מותאם לtrimester. ב-AnatoMe השיעורים מותאמים אנטומית לשינויים בגוף בהריון: חיזוק רצפת האגן, שיפור יציבה כדי להקל על כאבי גב, ותרגילים בטוחים שלא כוללים שכיבה על הגב אחרי השבוע ה-16. יובל דלל, המדריכה, מוסמכת בשיקום ומלווה נשים בהריון באופן קבוע.",
      },
      {
        question: "מה צריך בשביל פילאטיס בבית? האם צריך ציוד יקר?",
        answer: "לא. ב-AnatoMe מספיק מזרן אימונים בסיסי כדי להתחיל. יש שיעורים המותאמים לציוד ביתי פשוט (כיסא, מגבת, כרית). ככל שהתקדמות גדלה, אפשר להוסיף גומייה, כדור יציבות או רולר — אבל אין חובה. המערכת מסננת שיעורים לפי הציוד שיש לך בבית, כך שתמיד תמצאי תרגולים מתאימים.",
      },
    ];
  }

  const faqItems = $derived(makeFaqItems(t));

  function makeHowToSteps(t: ReturnType<typeof useI18n>['t']) {
    return [
      { position: 1, name: t.landing.schema.step1Name(), text: t.landing.schema.step1Text() },
      { position: 2, name: t.landing.schema.step2Name(), text: t.landing.schema.step2Text() },
      { position: 3, name: t.landing.schema.step3Name(), text: t.landing.schema.step3Text() },
    ];
  }

  const howToSteps = $derived(makeHowToSteps(t));

  function makeJsonLd(
    t: ReturnType<typeof useI18n>['t'],
    faqItems: ReturnType<typeof makeFaqItems>,
    howToSteps: ReturnType<typeof makeHowToSteps>,
    instructor: ReturnType<typeof makeInstructor>,
  ) {
    return schemaGraph(
      websiteSchema(),
      organizationSchema(),
      localBusinessSchema(),
      offerCatalogSchema(),
      courseSchema(),
      faqPageSchema(faqItems),
      howToSchema(t.landing.schema.howToTitle(), t.landing.schema.howToDescription(), howToSteps),
      medicalWebPageSchema(t.landing.seo.pageTitle(), SITE.description, pageUrl, today),
      personSchema(
        instructor.name,
        instructor.story,
        instructor.subtitle,
        t.landing.schema.instructorMentor(),
      ),
      breadcrumbSchema([{ name: t.landing.seo.breadcrumbHome(), url: SITE.domain }]),
    );
  }

  const jsonLd = $derived(makeJsonLd(t, faqItems, howToSteps, INSTRUCTOR));

  function openAuth() {
    openAuthOverlay();
  }

  function handleCtaSubmit(e: Event) {
    e.preventDefault();
    openSignupAuth();
  }
</script>

<SEO
  title={t.landing.seo.pageTitle()}
  description={t.landing.seo.pageDescription()}
  keywords={SITE.keywords}
  ogType="website"
  canonical={SITE.domain}
  jsonLd={jsonLd}
  breadcrumbs={[{ name: t.landing.seo.breadcrumbHome(), url: SITE.domain }]}
  preloadImage={SITE.heroPoster}
/>

<div class="landing-page" bind:this={landingRoot}>
  <div class="l-hero-fixed" class:l-hero-fixed--inactive={!heroActive}>
    <HeroBackground />
    <HeroSection openAuthOverlay={openAuth} />
  </div>
  <main class="landing l-scroll-cover" id="main-content">
    <div class="l-hero-spacer" aria-hidden="true"></div>
    <AboutSection instructor={INSTRUCTOR} />
    <StepsSection />
    <PricingSection />
    <FAQSection items={faqItems} />
    <div class="visually-hidden">
      <AiAnswerBox />
    </div>
    <section class="l-panel l-section section--cta" aria-label="התחילי עכשיו">
      <div class="l-shell">
        <div class="cta-panel l-in">
          <h2 class="cta-panel__title">
            {t.landing.cta.headlineLine1()}{#if t.landing.cta.headlineLine2()}<br />{t.landing.cta
                .headlineLine2()}{/if}
          </h2>
          <p class="cta-panel__lead">{t.landing.cta.subheadline()}</p>
          <form
            class="cta-panel__form"
            onsubmit={handleCtaSubmit}
          >
            <label class="visually-hidden" for="landing-cta-email">{t.auth.emailLabel()}</label>
            <input
              id="landing-cta-email"
              class="cta-panel__input"
              type="email"
              name="email"
              autocomplete="email"
              required
              bind:value={ctaEmail}
              placeholder={t.auth.emailLabel()}
            />
            <Button.Root
              class="hb-button hb-button--brand hb-button--pill cta-panel__submit"
              type="submit"
            >
              {t.landing.cta.button()}
            </Button.Root>
          </form>
          <p class="cta-panel__note">{t.landing.cta.note()}</p>
        </div>
      </div>
    </section>
  </main>

  <LandingFooter />
</div>
