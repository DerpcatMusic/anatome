<script lang="ts">
  import { Button } from "bits-ui";
  import { useI18n } from "$lib/i18n/runes";
  import { PLAN_DESCRIPTIONS } from "$lib/features/landing/landingPlans";
  import { useActivePlans } from "$lib/features/subscriptions/activePlans.svelte";
  import { openSubscriptionPicker } from "$lib/features/subscriptions/open-subscription-picker";
  import { planTierTheme } from "$lib/features/subscriptions/planTierTheme";
  import Notice from "$components/ui/Notice.svelte";
  import StoryCard from "./StoryCard.svelte";

  const { t } = useI18n();
  const activePlans = useActivePlans();

  const makePlanHandler = (slug: string) => () => {
    openSubscriptionPicker({ highlightSlug: slug });
  };
</script>

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
          onclick={makePlanHandler(activePlans.featured.slug)}
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
        onclick={makePlanHandler(plan.slug)}
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
