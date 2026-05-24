<script lang="ts">
  import { useI18n } from "$lib/i18n/runes";
  import { LANDING_PLANS, PLAN_DESCRIPTIONS } from "$lib/features/landing/landingPlans";

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
    {#each LANDING_PLANS as plan, index}
      <div class="pricing-card" class:pricing-card--featured={index === 1}>
        <div class="pricing-header">
          <span class="pricing-label">{plan.nameHe}</span>
          <span class="pricing-price" class:pricing-price--highlight={index !== 1}
            >{plan.monthlyPriceIls} ₪/חודש</span
          >
        </div>
        <p class="pricing-note">{PLAN_DESCRIPTIONS[plan.slug] ?? "מסלול חודשי עם קרדיטים לתרגול."}</p>
        <div class="pricing-breakdown">
          <span>פלטפורמה: {plan.platformFeeIls} ₪</span>
          <span>Macroflow: {plan.vodCreditsPerMonth} קרדיטים</span>
          <span>לייב קבוצתי: {plan.liveCreditsPerMonth} קרדיטים</span>
          <span>1:1 אישי: {plan.oneOnOneCreditsPerMonth} קרדיטים</span>
        </div>
        <button class="hb-button hb-button--ink" type="button" onclick={openAuthOverlay}>
          הפעלת מסלול
        </button>
      </div>
    {/each}
  </div>
  <p class="pricing-guarantee">
    כרגע אין ספק תשלום מחובר: המסלולים אמיתיים, והחיוב יחובר בהמשך דרך ספק סליקה ישראלי.
  </p>
</section>
