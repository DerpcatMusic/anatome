<script lang="ts">
  import { useI18n } from "$lib/i18n/runes";

  interface Props {
    openAuthOverlay: () => void;
  }

  let { openAuthOverlay }: Props = $props();

  const { t } = useI18n();
</script>

<section class="content-section section--pricing" aria-label="מחירים">
  <div class="section-header section-header--center">
    <span class="section-tag">{t.landing.pricing.tag()}</span>
    <h2>{t.landing.pricing.headline()}</h2>
  </div>
  <div class="pricing-grid">
    <div class="pricing-card pricing-card--featured">
      <div class="pricing-header">
        <span class="pricing-label">{t.landing.pricing.trial.label()}</span>
        <span class="pricing-price pricing-price--highlight">{t.landing.pricing.trial.price()}</span>
      </div>
      <p class="pricing-note">{t.landing.pricing.trial.note()}</p>
      <button class="btn btn--ink btn--full" onclick={openAuthOverlay}>
        {t.landing.pricing.ctaButton()}
      </button>
    </div>
    <div class="pricing-card">
      <div class="pricing-header">
        <span class="pricing-label">{t.landing.pricing.recorded.label()}</span>
        <span class="pricing-price">{t.landing.pricing.recorded.price()}</span>
      </div>
      <p class="pricing-note">{t.landing.pricing.recorded.note()}</p>
    </div>
    <div class="pricing-card">
      <div class="pricing-header">
        <span class="pricing-label">{t.landing.pricing.live.label()}</span>
        <span class="pricing-price">{t.landing.pricing.live.price()}</span>
      </div>
      <p class="pricing-note">{t.landing.pricing.live.note()}</p>
    </div>
    <div class="pricing-card">
      <div class="pricing-header">
        <span class="pricing-label">{t.landing.pricing.private.label()}</span>
        <span class="pricing-price">{t.landing.pricing.private.price()}</span>
      </div>
      <p class="pricing-note">{t.landing.pricing.private.note()}</p>
    </div>
  </div>
  <p class="pricing-guarantee">
    {t.landing.pricing.guarantee()}
  </p>
</section>
