<script lang="ts">
  import { useI18n } from "$lib/i18n/runes";

  const { t } = useI18n();

  function buildSteps(
    t1: string, b1: string,
    t2: string, b2: string,
    t3: string, b3: string,
  ) {
    return [
      { title: t1, body: b1 },
      { title: t2, body: b2 },
      { title: t3, body: b3 },
    ];
  }

  const steps = $derived(buildSteps(
    t.landing.steps.step1Title(),
    t.landing.steps.step1Desc(),
    t.landing.steps.step2Title(),
    t.landing.steps.step2Desc(),
    t.landing.steps.step3Title(),
    t.landing.steps.step3Desc(),
  ));
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
