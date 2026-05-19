<script lang="ts">
  import { useI18n } from '$lib/i18n/runes.svelte';
  import { experienceLabel, equipmentLabel, goalLabel } from '$lib/labels';

  let {
    experience,
    equipment,
    goals,
  }: {
    experience: "new" | "some" | "steady";
    equipment: string[];
    goals: string[];
  } = $props();

  const { t } = useI18n();
</script>

<div class="summary-box">
  <p class="summary-box__title">{t.onboarding.summary.boxTitle()}</p>
  <div class="summary-box__row"><span>{t.onboarding.summary.experience()}</span><span>{experienceLabel(experience)}</span></div>
  <div class="summary-box__row"><span>{t.onboarding.summary.equipment()}</span><span>{equipment.map(equipmentLabel).join(", ")}</span></div>
  <div class="summary-box__row"><span>{t.onboarding.summary.goals()}</span><span>{goals.map(goalLabel).join(", ")}</span></div>
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
    color: var(--muted);
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

  .summary-box__row:last-child {
    border-bottom: 0;
  }

  .summary-box__row span:first-child {
    color: var(--muted);
  }

  .summary-box__row span:last-child {
    font-weight: 700;
  }
</style>
