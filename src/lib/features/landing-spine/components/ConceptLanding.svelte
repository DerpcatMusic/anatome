<script lang="ts">
  import { onMount } from "svelte";
  import { Button } from "bits-ui";
  import { useI18n } from "$lib/i18n/runes";
  import { openAuthOverlay } from "$lib/auth/open-overlay";
  import { LANDING_IMAGES } from "$lib/features/landing/images";
  import { PLAN_DESCRIPTIONS } from "$lib/features/landing/landingPlans";
  import { useActivePlans } from "$lib/features/subscriptions/activePlans.svelte";
  import { openSubscriptionPicker } from "$lib/features/subscriptions/open-subscription-picker";
  import { planTierTheme } from "$lib/features/subscriptions/planTierTheme";
  import Notice from "$components/ui/Notice.svelte";
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

  const { t } = useI18n();
  const spine = createSpineLandingContext();
  setSpineLandingContext(spine);

  let hydrate3d = $state(false);
  let ctaEmail = $state("");

  const instructorStory = $derived(t.landing.instructor.storyClosing());

  const credentials = $derived([
    {
      title: t.landing.instructor.credTrainingTitle(),
      body: t.landing.instructor.credTraining(),
    },
    {
      title: t.landing.instructor.credExperienceTitle(),
      body: t.landing.instructor.credExperience(),
    },
    {
      title: t.landing.instructor.credMissionTitle(),
      body: t.landing.instructor.credMission(),
    },
  ]);

  const faqItems = $derived([
    { question: t.landing.faq.q1(), answer: t.landing.faq.a1() },
    { question: t.landing.faq.q2(), answer: t.landing.faq.a2() },
    { question: t.landing.faq.q3(), answer: t.landing.faq.a3() },
    { question: t.landing.faq.q4(), answer: t.landing.faq.a4() },
    { question: t.landing.faq.q5(), answer: t.landing.faq.a5() },
    { question: t.landing.faq.q6(), answer: t.landing.faq.a6() },
    { question: t.landing.faq.q7(), answer: t.landing.faq.a7() },
  ]);

  const activePlans = useActivePlans();

  onMount(() => {
    hydrate3d = true;
  });

  function openSignupAuth() {
    const email = ctaEmail.trim().toLowerCase();
    if (!email) {
      openAuthOverlay();
      return;
    }
    openAuthOverlay({ email, autoSendCode: true });
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
          {t.landing.hero.headlineBefore()}<span class="concept-hero__accent"
            >{t.landing.hero.headlineAccent()}</span
          >{t.landing.hero.headlineAfter()}
        </h1>
        <p class="concept-hero__lead">{t.landing.hero.lead()}</p>
        <div class="concept-actions">
          <Button.Root
            class="hb-button hb-button--brand hb-button--pill"
            type="button"
            onclick={() => openAuthOverlay()}
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

      <StoryCard region="cervical" sectionIndex={1} id="about" ariaLabel="על יובל">
        <p class="concept-eyebrow">{t.landing.instructor.sectionEyebrow()}</p>
        <h2 class="concept-section-title">{t.landing.instructor.sectionHeadline()}</h2>
        <p class="concept-section-lead">{t.landing.instructor.subtitle()}</p>
        <p class="concept-body">{t.landing.instructor.storyOrigin1()}</p>
        <p class="concept-body">{t.landing.instructor.storyOrigin2()}</p>
        <h3 class="concept-section-title" style="font-size: 1.25rem">
          {t.landing.instructor.whyMeHeadline()}
        </h3>
        <div class="concept-cred-grid">
          {#each credentials as cred (cred.title)}
            <article class="concept-cred">
              <h4>{cred.title}</h4>
              <p>{cred.body}</p>
            </article>
          {/each}
        </div>
        <p class="concept-body"><strong>{instructorStory}</strong></p>
        <figure class="concept-about__photo">
          <img
            src={LANDING_IMAGES.aboutInstructor.src}
            alt={t.landing.images.aboutAlt()}
            width={LANDING_IMAGES.aboutInstructor.width}
            height={LANDING_IMAGES.aboutInstructor.height}
            loading="lazy"
            decoding="async"
          />
        </figure>
      </StoryCard>

      <StoryCard region="thoracic" sectionIndex={2} ariaLabel="למה מהבית">
        <h2 class="concept-section-title">{t.landing.philosophy.headline()}</h2>
        <p class="concept-body">
          {t.landing.philosophy.bodyBefore()}<span class="concept-strike"
            >{t.landing.philosophy.bodyStrike()}</span
          >{t.landing.philosophy.bodyAfter()}
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
        <p class="concept-note" style="margin-top: 1rem">
          <a href="/library">{t.landing.preview.videoPlaceholderTitle()} →</a>
        </p>
      </StoryCard>

      <StoryCard region="sacrum" sectionIndex={5} ariaLabel="מחירים">
        <h2 class="concept-section-title">{t.landing.pricing.headline()}</h2>
        <p class="concept-section-lead">{t.landing.pricing.lead()}</p>
        {#if activePlans.error}
          <Notice tone="danger">לא הצלחנו לטעון מחירים מהשרת.</Notice>
        {:else if activePlans.usingFallback}
          <Notice tone="caution">מחירים להמחשה — חיבור לשרת לא זמין כרגע.</Notice>
        {/if}
        {#if activePlans.isLoading}
          <p class="concept-section-lead" aria-busy="true">טוענים מסלולים…</p>
        {:else if activePlans.featured}
          {@const featuredTheme = planTierTheme(activePlans.featured.slug)}
          <div class="concept-pricing__featured {featuredTheme.cardClass}">
            <div>
              <p class="concept-pricing__badge">{t.landing.pricing.featuredBadge()}</p>
              <h3>{activePlans.featured.nameHe}</h3>
              <p class="concept-body">
                {PLAN_DESCRIPTIONS[activePlans.featured.slug] ??
                  t.landing.pricing.planNoteFallback()}
              </p>
            </div>
            <div>
              <p class="concept-pricing__price">
                {activePlans.featured.monthlyPriceIls} {t.landing.pricing.perMonth()}
              </p>
              <Button.Root
                class="hb-button hb-button--brand hb-button--pill"
                type="button"
                onclick={() => openSubscriptionPicker({ highlightSlug: activePlans.featured.slug })}
              >
                {t.landing.pricing.ctaButton()}
              </Button.Root>
            </div>
          </div>
        {/if}
        <div class="concept-pricing__grid">
          {#each activePlans.otherPlans as plan (plan.slug)}
            {@const theme = planTierTheme(plan.slug)}
            <button
              type="button"
              class="concept-pricing__card {theme.cardClass}"
              onclick={() => openSubscriptionPicker({ highlightSlug: plan.slug })}
            >
              <h3>{plan.nameHe}</h3>
              <p class="concept-pricing__price">
                {plan.monthlyPriceIls} {t.landing.pricing.perMonth()}
              </p>
              <p class="concept-body">
                {PLAN_DESCRIPTIONS[plan.slug] ?? t.landing.pricing.planNoteFallback()}
              </p>
              <span class="hb-button hb-button--paper hb-button--sm">{t.landing.pricing.ctaButton()}</span>
            </button>
          {/each}
        </div>
        <p class="concept-note">{t.landing.pricing.guarantee()}</p>
      </StoryCard>

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
          onsubmit={(e) => {
            e.preventDefault();
            openSignupAuth();
          }}
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
