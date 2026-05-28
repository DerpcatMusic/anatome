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
    PhilosophySection,
    ExperienceSection,
    StepsSection,
    PricingSection,
    FAQSection,
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

  const INSTRUCTOR = $derived({
    name: t.landing.instructor.name(),
    story: t.landing.instructor.storyClosing(),
    subtitle: t.landing.instructor.subtitle(),
  });

  function openSignupAuth() {
    const email = ctaEmail.trim().toLowerCase();
    if (!email) {
      openAuthOverlay();
      return;
    }
    openAuthOverlay({ email, autoSendCode: true });
  }

  const pageUrl = SITE.domain;
  const today = new Date().toISOString().split("T")[0];

  const faqItems = $derived([
    { question: t.landing.faq.q1(), answer: t.landing.faq.a1() },
    { question: t.landing.faq.q2(), answer: t.landing.faq.a2() },
    { question: t.landing.faq.q3(), answer: t.landing.faq.a3() },
    { question: t.landing.faq.q4(), answer: t.landing.faq.a4() },
    { question: t.landing.faq.q5(), answer: t.landing.faq.a5() },
    { question: t.landing.faq.q6(), answer: t.landing.faq.a6() },
    { question: t.landing.faq.q7(), answer: t.landing.faq.a7() },
  ]);

  const howToSteps = $derived([
    { position: 1, name: t.landing.schema.step1Name(), text: t.landing.schema.step1Text() },
    { position: 2, name: t.landing.schema.step2Name(), text: t.landing.schema.step2Text() },
    { position: 3, name: t.landing.schema.step3Name(), text: t.landing.schema.step3Text() },
  ]);

  const jsonLd = $derived(
    schemaGraph(
      websiteSchema(),
      organizationSchema(),
      localBusinessSchema(),
      offerCatalogSchema(),
      courseSchema(),
      faqPageSchema(faqItems),
      howToSchema(t.landing.schema.howToTitle(), t.landing.schema.howToDescription(), howToSteps),
      medicalWebPageSchema(t.landing.seo.pageTitle(), SITE.description, pageUrl, today),
      personSchema(
        INSTRUCTOR.name,
        INSTRUCTOR.story,
        INSTRUCTOR.subtitle,
        t.landing.schema.instructorMentor(),
      ),
      breadcrumbSchema([{ name: t.landing.seo.breadcrumbHome(), url: SITE.domain }]),
    ),
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
  preloadImage={SITE.heroPoster}
/>

<div class="landing-page" bind:this={landingRoot}>
  <div class="l-hero-fixed" class:l-hero-fixed--inactive={!heroActive}>
    <HeroBackground />
    <HeroSection openAuthOverlay={() => openAuthOverlay()} />
  </div>

  <main class="landing l-scroll-cover" id="main-content">
    <div class="l-hero-spacer" aria-hidden="true"></div>

    <AboutSection instructor={INSTRUCTOR} />
    <PhilosophySection />
    <StepsSection />
    <ExperienceSection />
    <PricingSection />
    <FAQSection items={faqItems} />

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
            onsubmit={(e) => {
              e.preventDefault();
              openSignupAuth();
            }}
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
