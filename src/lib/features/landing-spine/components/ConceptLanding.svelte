<script lang="ts">
  import { Button } from "bits-ui";
  import { useI18n } from "$lib/i18n/runes";
  import { openAuthOverlay } from "$lib/auth/open-overlay";
  import LandingFooter from "$lib/features/landing/components/LandingFooter.svelte";
  import "../concept.css";
  import {
    createSpineLandingContext,
    setSpineLandingContext,
  } from "../spine-context.svelte";
  import SpineStage from "./SpineStage.svelte";
  import SpineScrollBinder from "./SpineScrollBinder.svelte";
  import SpineConnector from "./SpineConnector.svelte";
  import StoryCard from "./StoryCard.svelte";
  import ConceptAboutSection from "./ConceptAboutSection.svelte";
  import ConceptPricingSection from "./ConceptPricingSection.svelte";

  const { t } = useI18n();
  const spine = createSpineLandingContext();
  setSpineLandingContext(spine);

  let hydrate3d = $state(false);
  let ctaEmail = $state("");

  function buildFaqItems(
    q1: string, a1: string,
    q2: string, a2: string,
    q3: string, a3: string,
    q4: string, a4: string,
    q5: string, a5: string,
    q6: string, a6: string,
    q7: string, a7: string,
  ) {
    return [
      { question: q1, answer: a1 },
      { question: q2, answer: a2 },
      { question: q3, answer: a3 },
      { question: q4, answer: a4 },
      { question: q5, answer: a5 },
      { question: q6, answer: a6 },
      { question: q7, answer: a7 },
    ];
  }

  const faqItems = $derived(buildFaqItems(
    t.landing.faq.q1(), t.landing.faq.a1(),
    t.landing.faq.q2(), t.landing.faq.a2(),
    t.landing.faq.q3(), t.landing.faq.a3(),
    t.landing.faq.q4(), t.landing.faq.a4(),
    t.landing.faq.q5(), t.landing.faq.a5(),
    t.landing.faq.q6(), t.landing.faq.a6(),
    t.landing.faq.q7(), t.landing.faq.a7(),
  ));

  $effect(() => {
    hydrate3d = true;
    return () => {
      hydrate3d = false;
    };
  });

  function openSignupAuth() {
    const email = ctaEmail.trim().toLowerCase();
    if (!email) {
      openAuthOverlay();
      return;
    }
    openAuthOverlay({ email, autoSendCode: true });
  }

  function handleOpenAuthOverlay() {
    openAuthOverlay();
  }

  function handleCtaSubmit(e: SubmitEvent) {
    e.preventDefault();
    openSignupAuth();
  }
</script>

<div class="concept-page">
  <p class="concept-page__banner">רעיון עיצובי — AnatoMe Spine Story</p>

  <div class="concept-layout">
    <SpineStage {hydrate3d} />
    <SpineConnector />

    <main class="concept-scroll" id="main-content">
      <SpineScrollBinder />

      <StoryCard region="skull" sectionIndex={0} ariaLabel="ראשי">
        <h1 class="concept-hero__title">
          {t.landing.hero.headlineBefore()}<span class="concept-hero__accent">{t.landing.hero.headlineAccent()}</span
          >{t.landing.hero.headlineAfter()}
        </h1>
        <p class="concept-hero__lead">{t.landing.hero.lead()}</p>
        <div class="concept-actions">
          <Button.Root
            class="hb-button hb-button--brand hb-button--pill"
            type="button"
            onclick={handleOpenAuthOverlay}
          >
            {t.landing.hero.ctaPrimary()}
          </Button.Root>
          <Button.Root
            class="hb-button hb-button--paper hb-button--pill"
            href="#about"
          >
            {t.landing.hero.ctaSecondary()}
          </Button.Root>
        </div>
        <p class="concept-note">{t.landing.hero.note()}</p>
      </StoryCard>

      <ConceptAboutSection />

      <StoryCard region="thoracic" sectionIndex={2} ariaLabel="למה מהבית">
        <h2 class="concept-section-title">{t.landing.philosophy.headline()}</h2>
        <p class="concept-body">
          {t.landing.philosophy.bodyBefore()}{#if t.landing.philosophy.bodyStrike()}<span
              class="concept-strike">{t.landing.philosophy.bodyStrike()}</span
            >{/if}{t.landing.philosophy.bodyAfter()}
        </p>
      </StoryCard>

      <StoryCard region="thoracic" sectionIndex={3} ariaLabel="איך מתחילים">
        <h2 class="concept-section-title">{t.landing.steps.headline()}</h2>
        <ol class="concept-steps">
          <li class="concept-step">
            <span class="concept-step__index" aria-hidden="true">1</span>
            <div>
              <h3>{t.landing.steps.step1Title()}</h3>
              <p>{t.landing.steps.step1Desc()}</p>
            </div>
          </li>
          <li class="concept-step">
            <span class="concept-step__index" aria-hidden="true">2</span>
            <div>
              <h3>{t.landing.steps.step2Title()}</h3>
              <p>{t.landing.steps.step2Desc()}</p>
            </div>
          </li>
          <li class="concept-step">
            <span class="concept-step__index" aria-hidden="true">3</span>
            <div>
              <h3>{t.landing.steps.step3Title()}</h3>
              <p>{t.landing.steps.step3Desc()}</p>
            </div>
          </li>
          <li class="concept-step">
            <span class="concept-step__index" aria-hidden="true">4</span>
            <div>
              <h3>{t.landing.steps.step4Title()}</h3>
              <p>{t.landing.steps.step4Desc()}</p>
            </div>
          </li>
        </ol>
      </StoryCard>

      <StoryCard region="lumbar" sectionIndex={4} id="experience" ariaLabel="איך מתרגלים">
        <h2 class="concept-section-title">{t.landing.pillars.headline()}</h2>
        <p class="concept-section-lead">{t.landing.pillars.lead()}</p>
        <div class="concept-pillars">
          <article class="concept-pillar">
            <h3>{t.landing.pillars.macroTitle()}</h3>
            <p>{t.landing.pillars.macroLead()} — {t.landing.pillars.macroBody()}</p>
          </article>
          <article class="concept-pillar">
            <h3>{t.landing.pillars.microTitle()}</h3>
            <p>{t.landing.pillars.microLead()} — {t.landing.pillars.microBody()}</p>
          </article>
          <article class="concept-pillar">
            <h3>{t.landing.pillars.liveTitle()}</h3>
            <p>{t.landing.pillars.liveLead()} — {t.landing.pillars.liveBody()}</p>
          </article>
        </div>
        <p class="concept-note concept-note--spaced">
          <a href="/library">{t.landing.preview.videoPlaceholderTitle()} →</a>
        </p>
      </StoryCard>

      <ConceptPricingSection />

      <StoryCard region="coccyx" sectionIndex={6} ariaLabel="שאלות נפוצות">
        <h2 class="concept-section-title">{t.landing.faq.headline()}</h2>
        <div class="concept-faq">
          {#each faqItems as item (item.question)}
            <details>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          {/each}
        </div>
      </StoryCard>

      <StoryCard region="cta" sectionIndex={7} ariaLabel="התחילי עכשיו">
        <h2 class="concept-cta__title">
          {t.landing.cta.headlineLine1()}<br />{t.landing.cta.headlineLine2()}
        </h2>
        <p class="concept-section-lead">{t.landing.cta.subheadline()}</p>
        <form
          class="concept-cta__form"
          onsubmit={handleCtaSubmit}
        >
          <label class="visually-hidden" for="concept-cta-email">{t.auth.emailLabel()}</label>
          <input
            id="concept-cta-email"
            class="concept-cta__input"
            type="email"
            name="email"
            autocomplete="email"
            required
            bind:value={ctaEmail}
            placeholder={t.auth.emailLabel()}
          />
          <Button.Root
            class="hb-button hb-button--brand hb-button--pill"
            type="submit"
          >
            {t.landing.cta.button()}
          </Button.Root>
        </form>
        <p class="concept-note">{t.landing.cta.note()}</p>
      </StoryCard>
    </main>
  </div>

  <div class="concept-footer">
    <a href="/">← חזרה לדף הבית</a>
    <nav class="concept-footer__links" aria-label="קישורים">
      <a href="/legal/terms">תנאים</a>
      <a href="/legal/privacy">פרטיות</a>
    </nav>
  </div>

  <LandingFooter />
</div>

<style>
  .concept-note--spaced {
    margin-top: 1rem;
  }
</style>
