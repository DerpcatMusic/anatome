<script lang="ts">
  import { useI18n } from "$lib/i18n/runes";

  const { t } = useI18n();
</script>

<section class="l-panel l-section section--steps" aria-label="איך מתחילים">
  <div class="l-shell">
    <header class="steps__header l-in">
      <h2 class="section-title">{t.landing.steps.headline()}</h2>
    </header>

    <div class="steps__timeline">
      <div class="steps__progress" aria-hidden="true"></div>
      <ol class="steps">
      <li class="step l-in l-in--1">
        <span class="step__index" aria-hidden="true">1</span>
        <div>
          <h3>{t.landing.steps.step1Title()}</h3>
          <p>{t.landing.steps.step1Desc()}</p>
        </div>
      </li>
      <li class="step l-in l-in--2">
        <span class="step__index" aria-hidden="true">2</span>
        <div>
          <h3>{t.landing.steps.step2Title()}</h3>
          <p>{t.landing.steps.step2Desc()}</p>
        </div>
      </li>
      <li class="step l-in l-in--3">
        <span class="step__index" aria-hidden="true">3</span>
        <div>
          <h3>{t.landing.steps.step3Title()}</h3>
          <p>{t.landing.steps.step3Desc()}</p>
        </div>
      </li>
      <li class="step l-in l-in--3">
        <span class="step__index" aria-hidden="true">4</span>
        <div>
          <h3>{t.landing.steps.step4Title()}</h3>
          <p>{t.landing.steps.step4Desc()}</p>
        </div>
      </li>
      </ol>
    </div>
  </div>
</section>
