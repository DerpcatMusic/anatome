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
    ExperienceSection,
    StepsSection,
    PricingSection,
    FAQSection,
  } from "$lib/features/landing/components";
  import { useI18n } from "$lib/i18n/runes";
  import { Button } from "bits-ui";
  import { browser } from "$app/environment";

  const { t } = useI18n();

  let heroActive = $state(true);

  $effect(() => createHeroScrollActive((active) => {
    heroActive = active;
  }));

  const INSTRUCTOR = $derived({
    name: t.landing.instructor.name(),
    years: "10",
    story: t.landing.instructor.storyClosing(),
  });

  function openAuthOverlay() {
    window.dispatchEvent(new CustomEvent("anatome:auth-open"));
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

  const howToSteps = [
    { position: 1, name: t.landing.schema.step1Name(), text: t.landing.schema.step1Text() },
    { position: 2, name: t.landing.schema.step2Name(), text: t.landing.schema.step2Text() },
    { position: 3, name: t.landing.schema.step3Name(), text: t.landing.schema.step3Text() },
  ];

  const jsonLd = schemaGraph(
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
  preloadImage={SITE.heroPoster}
/>

<div class="landing-page">
  <div class="l-hero-fixed" class:l-hero-fixed--inactive={!heroActive}>
    <HeroBackground />
    {#if browser}
      {#await import("$lib/features/landing/components/MeshGradient.svelte") then { default: MeshGradient }}
        <div class="landing-page__mesh">
          <MeshGradient variant="hero" />
        </div>
      {/await}
    {/if}
    <HeroSection {openAuthOverlay} />
  </div>

  <main class="landing l-scroll-cover" id="main-content">
    <div class="l-hero-spacer" aria-hidden="true"></div>

    <AboutSection instructor={INSTRUCTOR} />
    <StepsSection />
    <ExperienceSection />
    <PricingSection {openAuthOverlay} />
    <FAQSection items={faqItems} />

    <section class="l-panel l-section section--cta" aria-label="התחילי עכשיו">
      <div class="l-shell cta l-in">
        <h2>{t.landing.cta.headlineLine1()}<br />{t.landing.cta.headlineLine2()}</h2>
        <p class="cta__lead">{t.landing.cta.subheadline()}</p>
        <Button.Root
          class="hb-button hb-button--brand hb-button--pill"
          type="button"
          onclick={openAuthOverlay}
        >
          {t.landing.cta.button()}
        </Button.Root>
        <p class="cta__note">{t.landing.cta.note()}</p>
      </div>
    </section>
  </main>

  <LandingFooter />
</div>
