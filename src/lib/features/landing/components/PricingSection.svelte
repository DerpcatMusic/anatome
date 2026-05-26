<script lang="ts">
  import { Button } from "bits-ui";
  import { useI18n } from "$lib/i18n/runes";
  import { LANDING_PLANS, PLAN_DESCRIPTIONS } from "$lib/features/landing/landingPlans";

  interface Props {
    openAuthOverlay: () => void;
  }

  let { openAuthOverlay }: Props = $props();

  const { t } = useI18n();

  const featuredSlug = "guided";
  const featured = $derived(LANDING_PLANS.find((p) => p.slug === featuredSlug));
  const otherPlans = $derived(LANDING_PLANS.filter((p) => p.slug !== featuredSlug));
</script>

<section class="l-panel l-section section--pricing" aria-label="מחירים">
  <div class="l-shell">
    <h2 class="section-title l-in">{t.landing.pricing.headline()}</h2>

    <div class="pricing">
      {#if featured}
        <div class="pricing__featured l-in">
          <div>
            <p class="pricing__badge">{t.landing.pricing.featuredBadge()}</p>
            <h3>{featured.nameHe}</h3>
            <p class="pricing__desc">{PLAN_DESCRIPTIONS[featured.slug] ?? t.landing.pricing.planNoteFallback()}</p>
          </div>
          <div class="pricing__featured-side">
            <p class="pricing__price">{featured.monthlyPriceIls} {t.landing.pricing.perMonth()}</p>
            <Button.Root
              class="hb-button hb-button--brand"
              type="button"
              onclick={openAuthOverlay}
            >
              {t.landing.pricing.ctaButton()}
            </Button.Root>
          </div>
        </div>
      {/if}

      <div class="pricing__grid">
        {#each otherPlans as plan (plan.slug)}
          <article class="pricing__card l-in">
            <h3>{plan.nameHe}</h3>
            <p class="pricing__price">{plan.monthlyPriceIls} {t.landing.pricing.perMonth()}</p>
            <p class="pricing__desc">{PLAN_DESCRIPTIONS[plan.slug] ?? t.landing.pricing.planNoteFallback()}</p>
            <Button.Root
              class="hb-button hb-button--paper"
              type="button"
              onclick={openAuthOverlay}
            >
              {t.landing.pricing.ctaButton()}
            </Button.Root>
          </article>
        {/each}
      </div>
    </div>

    <p class="pricing__guarantee l-in">{t.landing.pricing.guarantee()}</p>
  </div>
</section>
