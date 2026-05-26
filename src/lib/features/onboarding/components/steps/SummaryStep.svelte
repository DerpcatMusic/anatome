<script lang="ts">
  import { useI18n } from "$lib/i18n/runes.svelte";
  import {
    experienceLabel,
    equipmentLabel,
    goalLabel,
    pathologyLabel,
    fmtList,
  } from "$lib/labels";
  import {
    hasHealthDeclarationYes,
    isHealthDeclarationComplete,
    type HealthDeclarationAnswers,
  } from "$lib/features/onboarding/health-declaration";

  let {
    experience,
    equipment,
    goals,
    pathologies,
    notes,
    healthDeclarationAnswers,
    healthDeclarationAccepted,
    healthInfoConsent,
  }: {
    experience: "new" | "some" | "steady";
    equipment: string[];
    goals: string[];
    pathologies: string[];
    notes: string;
    healthDeclarationAnswers: HealthDeclarationAnswers;
    healthDeclarationAccepted: boolean;
    healthInfoConsent: boolean;
  } = $props();

  const { t } = useI18n();

  const pathologySummary = $derived(
    pathologies.length > 0
      ? pathologies.map(pathologyLabel).join(", ")
      : t.onboarding.summary.pathologiesNone(),
  );

  const notesSummary = $derived(
    notes.trim().length > 0 ? notes.trim() : t.onboarding.summary.notesNone(),
  );

  const healthSummary = $derived(
    !isHealthDeclarationComplete(healthDeclarationAnswers)
      ? t.onboarding.summary.healthIncomplete()
      : hasHealthDeclarationYes(healthDeclarationAnswers)
        ? t.onboarding.summary.healthYesAnswers()
        : t.onboarding.summary.healthClear(),
  );
</script>

<div class="summary-box">
  <p class="summary-box__title">{t.onboarding.summary.boxTitle()}</p>

  <div class="summary-box__row">
    <span>{t.onboarding.summary.experience()}</span>
    <span>{experienceLabel(experience)}</span>
  </div>
  <div class="summary-box__row">
    <span>{t.onboarding.summary.equipment()}</span>
    <span>{equipment.map(equipmentLabel).join(", ")}</span>
  </div>
  <div class="summary-box__row">
    <span>{t.onboarding.summary.goals()}</span>
    <span>{goals.map(goalLabel).join(", ")}</span>
  </div>
  <div class="summary-box__row summary-box__row--stack">
    <span>{t.onboarding.summary.pathologies()}</span>
    <span>{pathologySummary}</span>
  </div>
  <div class="summary-box__row summary-box__row--stack">
    <span>{t.onboarding.summary.notes()}</span>
    <span class="summary-box__notes">{notesSummary}</span>
  </div>
  <div class="summary-box__row summary-box__row--stack">
    <span>{t.onboarding.summary.health()}</span>
    <span>{healthSummary}</span>
  </div>
  <div class="summary-box__row">
    <span>{t.onboarding.summary.declaration()}</span>
    <span>{healthDeclarationAccepted ? t.onboarding.summary.confirmed() : t.onboarding.summary.pending()}</span>
  </div>
  {#if healthInfoConsent}
    <div class="summary-box__row">
      <span>{t.onboarding.summary.consent()}</span>
      <span>{t.onboarding.summary.confirmed()}</span>
    </div>
  {/if}
</div>

<style>
  .summary-box {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-5);
    background: var(--surface);
    border: var(--border);
  }

  .summary-box__title {
    font-family: var(--font-mono);
    font-size: var(--step--1);
    font-weight: 700;
    color: var(--foreground-muted);
    margin: 0;
  }

  .summary-box__row {
    display: flex;
    justify-content: space-between;
    gap: var(--space-4);
    font-size: var(--step-0);
    padding-block: var(--space-2);
    border-bottom: var(--border);
  }

  .summary-box__row--stack {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-2);
  }

  .summary-box__row:last-child {
    border-bottom: 0;
  }

  .summary-box__row span:first-child {
    color: var(--foreground-muted);
    font-family: var(--font-mono);
    font-size: var(--step--1);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .summary-box__row span:last-child {
    font-weight: 700;
    line-height: 1.45;
  }

  .summary-box__notes {
    white-space: pre-wrap;
    font-weight: 650;
  }
</style>
