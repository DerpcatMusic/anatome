<script lang="ts">
  import { useI18n } from "$lib/i18n/runes.svelte";
  import {
    healthDeclarationQuestionIds,
    type HealthDeclarationAnswers,
  } from "$lib/features/onboarding/health-declaration";
  import { Checkbox, RadioGroup } from "bits-ui";

  let {
    answers = $bindable(),
    healthInfoConsent = $bindable(),
    healthDeclarationAccepted = $bindable(),
    needsHealthConsent = false,
  }: {
    answers: HealthDeclarationAnswers;
    healthInfoConsent: boolean;
    healthDeclarationAccepted: boolean;
    needsHealthConsent?: boolean;
  } = $props();

  const { t } = useI18n();

  function questionLabel(id: (typeof healthDeclarationQuestionIds)[number]) {
    return t.onboarding.healthDeclaration.questions[id]();
  }
</script>

<div class="health-step">
  <p class="health-step__intro">{t.onboarding.healthDeclaration.intro()}</p>

  <div class="health-step__questions">
    {#each healthDeclarationQuestionIds as questionId (questionId)}
      <fieldset class="health-question">
        <legend>{questionLabel(questionId)}</legend>
        <RadioGroup.Root
          value={answers[questionId] ?? undefined}
          onValueChange={(value) => {
            if (value === "yes" || value === "no") {
              answers = { ...answers, [questionId]: value };
            }
          }}
          orientation="horizontal"
          class="health-question__choices"
        >
          <RadioGroup.Item value="no" class="hb-choice health-yn-choice">
            {#snippet children()}
              <span>{t.onboarding.healthDeclaration.no()}</span>
            {/snippet}
          </RadioGroup.Item>
          <RadioGroup.Item value="yes" class="hb-choice health-yn-choice">
            {#snippet children()}
              <span>{t.onboarding.healthDeclaration.yes()}</span>
            {/snippet}
          </RadioGroup.Item>
        </RadioGroup.Root>
      </fieldset>
    {/each}
  </div>

  <div class="health-step__disclaimer">
    <p>{t.onboarding.healthDeclaration.disclaimer()}</p>
  </div>

  <div class="health-consent-row">
    <Checkbox.Root
      class="health-consent-check"
      bind:checked={healthDeclarationAccepted}
    >
      {#snippet children({ checked })}
        <span class="health-consent-check__box" data-checked={checked} aria-hidden="true"></span>
        <span>{t.onboarding.healthDeclaration.truthStatement()}</span>
      {/snippet}
    </Checkbox.Root>
  </div>

  {#if needsHealthConsent}
  <div class="health-step__consent" data-active="true">
    <p>{t.onboarding.healthDeclaration.consentIntro()}</p>
    <div class="health-consent-row">
      <Checkbox.Root
        class="health-consent-check"
        bind:checked={healthInfoConsent}
      >
        {#snippet children({ checked })}
          <span class="health-consent-check__box" data-checked={checked} aria-hidden="true"></span>
          <span>{t.onboarding.healthDeclaration.consentLabel()}</span>
        {/snippet}
      </Checkbox.Root>
    </div>
  </div>
  {/if}
</div>

<style>
  .health-step {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
    min-width: 0;
  }

  .health-step__intro,
  .health-step__disclaimer p,
  .health-step__consent p {
    margin: 0;
    font-size: var(--step--1);
    line-height: 1.55;
    color: var(--foreground-muted);
  }

  .health-step__questions {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .health-question {
    margin: 0;
    padding: var(--space-4);
    border: var(--border);
    background: var(--paper);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .health-question legend {
    font-size: var(--step-0);
    font-weight: 700;
    line-height: 1.45;
    color: var(--ink);
    padding: 0;
  }

  .health-question :global(.health-question__choices) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-2);
  }

  .health-question :global(.health-yn-choice) {
    min-height: 44px;
    justify-content: center;
    text-align: center;
    font-weight: 700;
  }

  .health-question :global(.health-yn-choice[data-state="checked"]),
  .health-question :global(.health-yn-choice[data-selected="true"]) {
    transform: none;
    box-shadow: none;
  }

  .health-step__disclaimer {
    padding: var(--space-4);
    border: var(--border);
    background: var(--surface);
  }

  .health-step__consent {
    display: grid;
    gap: var(--space-3);
    padding: var(--space-4);
    border: var(--border);
    background: var(--paper);
  }

  .health-step :global(.health-consent-check) {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    cursor: pointer;
    text-align: start;
    font-size: var(--step-0);
    font-weight: 700;
    line-height: 1.45;
    color: var(--ink);
    border: 0;
    background: transparent;
    padding: 0;
  }

  .health-step :global(.health-consent-check[data-disabled]) {
    cursor: default;
    opacity: 0.55;
  }

  .health-consent-check__box {
    flex: 0 0 20px;
    width: 20px;
    height: 20px;
    margin-block-start: 0.15em;
    border: 2px solid var(--ink);
    background: var(--white);
    position: relative;
  }

  .health-consent-check__box[data-checked="true"]::after {
    content: "";
    position: absolute;
    inset: 3px;
    background: var(--ink);
  }

  .health-consent-row:focus-within .health-consent-check__box {
    outline: 2px solid var(--secondary);
    outline-offset: 2px;
  }
</style>
