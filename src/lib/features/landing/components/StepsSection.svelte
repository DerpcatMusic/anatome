<script lang="ts">
  import { useI18n } from "$lib/i18n/runes";

  const { t } = useI18n();
</script>

<section class="l-panel l-section section--steps" aria-label="איך מתחילים">
  <div class="l-shell">
    <h2 class="section-title l-in">{t.landing.steps.headline()}</h2>

    <div class="steps">
      <article class="step l-in l-in--1">
        <h3>{t.landing.steps.step1Title()}</h3>
        <p>{t.landing.steps.step1Desc()}</p>
      </article>
      <article class="step l-in l-in--2">
        <h3>{t.landing.steps.step2Title()}</h3>
        <p>{t.landing.steps.step2Desc()}</p>
      </article>
      <article class="step l-in l-in--3">
        <h3>{t.landing.steps.step3Title()}</h3>
        <p>{t.landing.steps.step3Desc()}</p>
      </article>
    </div>
  </div>
</section>
