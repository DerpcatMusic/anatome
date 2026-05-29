<script lang="ts">
  import { useI18n } from "$lib/i18n/runes";

  const { t } = useI18n();

  const steps = $derived([
    { title: t.landing.steps.step1Title(), body: t.landing.steps.step1Desc() },
    { title: t.landing.steps.step2Title(), body: t.landing.steps.step2Desc() },
    { title: t.landing.steps.step3Title(), body: t.landing.steps.step3Desc() },
  ]);
</script>

<section class="l-panel l-section section--steps" aria-label="איך מתחילים">
  <div class="l-shell steps">
    <header class="section-head section-head--center l-in">
      <h2 class="section-title">{t.landing.steps.headline()}</h2>
      {#if t.landing.steps.lead()}
        <p class="section-lead">{t.landing.steps.lead()}</p>
      {/if}
    </header>

    <ul class="steps__grid">
      {#each steps as step, i (step.title)}
        <li class="steps__card l-in" class:l-in--1={i === 0} class:l-in--2={i === 1} class:l-in--3={i === 2}>
          <h3 class="steps__card-title">{step.title}</h3>
          <p class="steps__card-body">{step.body}</p>
        </li>
      {/each}
    </ul>
  </div>
</section>
