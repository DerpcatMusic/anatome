<script lang="ts">
  import { Button } from "bits-ui";
  import { useI18n } from "$lib/i18n/runes";
  import { PLAN_DESCRIPTIONS } from "$lib/features/landing/landingPlans";
  import { useActivePlans } from "$lib/features/subscriptions/activePlans.svelte";
  import { openSubscriptionPicker } from "$lib/features/subscriptions/open-subscription-picker";
  import { planTierTheme } from "$lib/features/subscriptions/planTierTheme";
  import Notice from "$components/ui/Notice.svelte";

  function pickPlan(slug: string) {
    openSubscriptionPicker({ highlightSlug: slug });
  }

  function handlePickFeatured() {
    if (activePlans.featured) {
      pickPlan(activePlans.featured.slug);
    }
  }

  function handlePickPlan(slug: string) {
    pickPlan(slug);
  }

  const makePickPlanHandler = (slug: string) => () => handlePickPlan(slug);

  const { t } = useI18n();
  const activePlans = useActivePlans();
</script>

<section class="l-panel l-section section--pricing" aria-label="מחירים">
  <div class="l-shell">
    <header class="section-head section-head--center l-in">
      <h2 class="section-title">{t.landing.pricing.headline()}</h2>
      <p class="section-lead">{t.landing.pricing.lead()}</p>
    </header>

    {#if activePlans.error}
      <Notice tone="danger">
        לא הצלחנו לטעון מחירים מהשרת. בדקו ש־Convex מחובר (PUBLIC_CONVEX_CLIENT_URL).
      </Notice>
    {:else if activePlans.usingFallback}
      <Notice tone="caution">מחירים להמחשה — חיבור לשרת לא זמין כרגע.</Notice>
    {/if}

    <div class="pricing">
      {#if activePlans.isLoading}
        <p class="section-lead" aria-busy="true">טוענים מסלולים…</p>
      {:else if activePlans.featured}
        {@const featuredTheme = planTierTheme(activePlans.featured.slug)}
        <div class="pricing__featured l-in {featuredTheme.cardClass}">
          <div>
            <p class="pricing__badge">{t.landing.pricing.featuredBadge()}</p>
            <h3>{activePlans.featured.nameHe}</h3>
            <p class="pricing__desc">
              {PLAN_DESCRIPTIONS[activePlans.featured.slug] ??
                t.landing.pricing.planNoteFallback()}
            </p>
          </div>
          <div class="pricing__featured-side">
            <p class="pricing__price">
              {activePlans.featured.monthlyPriceIls} {t.landing.pricing.perMonth()}
            </p>
            <Button.Root
              class="hb-button hb-button--brand hb-button--pill"
              type="button"
              onclick={handlePickFeatured}
            >
              {t.landing.pricing.ctaButton()}
            </Button.Root>
          </div>
        </div>

        <div class="pricing__grid">
          {#each activePlans.otherPlans as plan (plan.slug)}
            {@const theme = planTierTheme(plan.slug)}
            <article class="pricing__card l-in {theme.cardClass}">
              <h3>{plan.nameHe}</h3>
              <p class="pricing__price">{plan.monthlyPriceIls} {t.landing.pricing.perMonth()}</p>
              <p class="pricing__desc">
                {PLAN_DESCRIPTIONS[plan.slug] ?? t.landing.pricing.planNoteFallback()}
              </p>
              <Button.Root
                class="hb-button hb-button--paper"
                type="button"
                onclick={makePickPlanHandler(plan.slug)}
              >
                {t.landing.pricing.ctaButton()}
              </Button.Root>
            </article>
          {/each}
        </div>
      {:else}
        <Notice tone="danger">אין מסלולים להצגה כרגע.</Notice>
      {/if}
    </div>

    <p class="pricing__guarantee l-in">{t.landing.pricing.guarantee()}</p>
  </div>
</section>
