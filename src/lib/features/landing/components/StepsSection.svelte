<script lang="ts">
  import { useI18n } from "$lib/i18n/runes";

  const { t } = useI18n();
</script>

<section class="content-section section--steps" aria-label="איך זה עובד">
  <div class="section-header section-header--center">
    <span class="section-tag">{t.landing.steps.tag()}</span>
    <h2>{t.landing.steps.headline()}</h2>
  </div>
  <div class="steps-grid">
    <div class="step">
      <span class="step-num">01</span>
      <h3>{t.landing.steps.step1Title()}</h3>
      <p>{t.landing.steps.step1Desc()}</p>
    </div>
    <div class="step">
      <span class="step-num">02</span>
      <h3>{t.landing.steps.step2Title()}</h3>
      <p>{t.landing.steps.step2Desc()}</p>
    </div>
    <div class="step">
      <span class="step-num">03</span>
      <h3>{t.landing.steps.step3Title()}</h3>
      <p>{t.landing.steps.step3Desc()}</p>
    </div>
  </div>
</section>
