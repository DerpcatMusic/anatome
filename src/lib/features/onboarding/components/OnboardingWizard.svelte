<script lang="ts">
  import { Button } from "bits-ui";
  import Notice from "$components/ui/Notice.svelte";
  import ExperienceStep from "./steps/ExperienceStep.svelte";
  import EquipmentStep from "./steps/EquipmentStep.svelte";
  import GoalsStep from "./steps/GoalsStep.svelte";
  import NotesStep from "./steps/NotesStep.svelte";
  import HealthDeclarationStep from "./steps/HealthDeclarationStep.svelte";
  import SummaryStep from "./steps/SummaryStep.svelte";
  import NameStep from "./steps/NameStep.svelte";
  import {
    hasHealthDeclarationYes,
    isHealthDeclarationComplete,
  } from "$lib/features/onboarding/health-declaration";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import type { Equipment, Goal, Pathology } from "$lib/labels";
  import type { HealthDeclarationAnswers } from "$lib/features/onboarding/health-declaration";
  import { useOnboardingValidation } from "./onboarding-validation";
  import { useWizardNav } from "./useWizardNav.svelte";

  interface StepDef {
    id: "name" | "experience" | "equipment" | "goals" | "notes" | "health-declaration" | "summary";
    title: string;
    subtitle: string;
  }

  let {
    mode,
    steps,
    stepIndex = $bindable(),
    firstName = $bindable(),
    lastName = $bindable(),
    experience = $bindable(),
    equipment = $bindable(),
    goals = $bindable(),
    pathologies = $bindable(),
    notes = $bindable(),
    healthDeclarationAnswers = $bindable(),
    healthInfoConsent = $bindable(),
    healthDeclarationAccepted = $bindable(),
    nameWarning = $bindable(),
    stepValidationAttempted = $bindable(),
    error = $bindable(),
    pending,
    onSubmit,
  }: {
    mode: "onboarding" | "edit";
    steps: readonly StepDef[];
    stepIndex: number;
    firstName: string;
    lastName: string;
    experience: "new" | "some" | "steady";
    equipment: Equipment[];
    goals: Goal[];
    pathologies: Pathology[];
    notes: string;
    healthDeclarationAnswers: HealthDeclarationAnswers;
    healthInfoConsent: boolean;
    healthDeclarationAccepted: boolean;
    nameWarning: boolean;
    stepValidationAttempted: boolean;
    error: string;
    pending: boolean;
    onSubmit: () => void;
  } = $props();

  const { t } = useI18n();

  const { stepIsIncomplete, stepBlockReason } = useOnboardingValidation(() => ({
    firstName,
    lastName,
    equipment,
    goals,
    healthDeclarationAnswers,
    healthDeclarationAccepted,
    healthInfoConsent,
    healthComplete,
    healthConsentsComplete,
    nameComplete,
  }));

  const currentStep = $derived(steps[stepIndex]);
  const isFirst = $derived(stepIndex === 0);
  const isLast = $derived(stepIndex === steps.length - 1);
  const progressPercent = $derived(((stepIndex + 1) / steps.length) * 100);

  const nameComplete = $derived(firstName.trim().length > 0 && lastName.trim().length > 0);
  const healthComplete = $derived(isHealthDeclarationComplete(healthDeclarationAnswers));
  const healthConsentsComplete = $derived(healthDeclarationAccepted && healthInfoConsent);



  const canProceed = $derived(
    currentStep.id === "name"
      ? nameComplete
      : currentStep.id === "equipment"
        ? equipment.length > 0
        : currentStep.id === "goals"
          ? goals.length > 0
          : currentStep.id === "health-declaration"
            ? healthComplete && healthConsentsComplete
            : true,
  );

  const readyToSubmit = $derived(
    nameComplete &&
      equipment.length > 0 &&
      goals.length > 0 &&
      healthComplete &&
      healthDeclarationAccepted &&
      healthInfoConsent,
  );

  const footerBlockReason = $derived.by(() => {
    if (!stepValidationAttempted || canProceed) return null;
    return stepBlockReason(currentStep.id);
  });

  const healthDeclarationStepIndex = $derived(steps.findIndex((s) => s.id === "health-declaration"));

  const { handleGoToStep, next, back } = useWizardNav(
    {
      getStepIndex: () => stepIndex,
      getCanProceed: () => canProceed,
      getIsFirst: () => isFirst,
      getIsLast: () => isLast,
      getCurrentStepId: () => currentStep.id,
      getNameComplete: () => nameComplete,
    },
    {
      setStepIndex: (v) => { stepIndex = v; },
      setStepValidationAttempted: (v) => { stepValidationAttempted = v; },
      setError: (v) => { error = v; },
      setNameWarning: (v) => { nameWarning = v; },
    },
  );
</script>

<div class="onboarding">
  <div class="panel panel--question">
    <div class="panel__inner">
      <div class="question">
        <h1>{currentStep.title}</h1>
        {#if currentStep.subtitle}
          <p>{currentStep.subtitle}</p>
        {/if}
      </div>
    </div>
  </div>

  <div class="panel panel--form">
    <div class="panel__inner">
      {#if mode === "onboarding"}
        {@render stepNav()}
      {/if}

      <div class="form-body">
        {#if currentStep.id === "name"}
          <NameStep bind:firstName bind:lastName showWarning={nameWarning} />
        {:else if currentStep.id === "experience"}
          <ExperienceStep bind:experience />
        {:else if currentStep.id === "equipment"}
          <EquipmentStep bind:equipment showWarning={stepValidationAttempted && equipment.length === 0} />
        {:else if currentStep.id === "goals"}
          <GoalsStep bind:goals showWarning={stepValidationAttempted && goals.length === 0} />
        {:else if currentStep.id === "notes"}
          <NotesStep bind:pathologies bind:notes />
        {:else if currentStep.id === "health-declaration"}
          <HealthDeclarationStep
            bind:answers={healthDeclarationAnswers}
            bind:healthInfoConsent
            bind:healthDeclarationAccepted
            needsHealthConsent={currentStep.id === "health-declaration" || pathologies.length > 0 || notes.trim().length > 0 || hasHealthDeclarationYes(healthDeclarationAnswers)}
            showValidation={stepValidationAttempted && !canProceed}
          />
        {:else if currentStep.id === "summary"}
          {#if stepValidationAttempted && !readyToSubmit}
            {@render summaryMissingList()}
          {/if}
          <SummaryStep
            {firstName}
            {lastName}
            {experience}
            {equipment}
            {goals}
            {pathologies}
            {notes}
            {healthDeclarationAnswers}
            {healthDeclarationAccepted}
            {healthInfoConsent}
          />
        {/if}

        {#if footerBlockReason}
          <Notice tone="neutral">{footerBlockReason}</Notice>
        {/if}

        {#if error}
          <Notice tone="danger">{error}</Notice>
        {/if}
      </div>

      {@render formFooter()}
    </div>
  </div>
</div>

{#snippet stepNav()}
  <div class="progress-bar" role="progressbar" aria-valuenow={stepIndex + 1} aria-valuemin={1} aria-valuemax={steps.length} aria-label={t.onboarding.step()}>
    <div class="progress-bar__fill" style:--progress-width="{progressPercent}%"></div>
  </div>
  <div class="progress-label">{t.onboarding.step()} {stepIndex + 1} {t.onboarding.stepCount()}</div>
  <nav class="step-nav" aria-label="שלבי ההרשמה">
    {#each steps as step, index (step.id)}
      <button
        type="button"
        class="step-nav__item"
        class:step-nav__item--current={index === stepIndex}
        class:step-nav__item--incomplete={stepIsIncomplete(step.id)}
        aria-current={index === stepIndex ? "step" : undefined}
        onclick={handleGoToStep(index)}
      >
        <span class="step-nav__index">{index + 1}</span>
        <span class="step-nav__label">{step.title}</span>
      </button>
    {/each}
  </nav>
{/snippet}

{#snippet summaryMissingList()}
  <Notice tone="neutral">
    <p>לפני שמירה, יש להשלים:</p>
    <ul class="onboarding-missing-list">
      {#if !nameComplete}
        <li>
          <button type="button" class="onboarding-missing-link" onclick={handleGoToStep(0)}>
            שם מלא
          </button>
        </li>
      {/if}
      {#if equipment.length === 0}
        <li>
          <button
            type="button"
            class="onboarding-missing-link"
            onclick={handleGoToStep(steps.findIndex((s) => s.id === "equipment"))}
          >
            בחירת ציוד
          </button>
        </li>
      {/if}
      {#if goals.length === 0}
        <li>
          <button
            type="button"
            class="onboarding-missing-link"
            onclick={handleGoToStep(steps.findIndex((s) => s.id === "goals"))}
          >
            בחירת מטרות
          </button>
        </li>
      {/if}
      {#if !healthComplete || !healthConsentsComplete}
        <li>
          <button
            type="button"
            class="onboarding-missing-link"
            onclick={handleGoToStep(healthDeclarationStepIndex)}
          >
            הצהרת בריאות והסכמות
          </button>
        </li>
      {/if}
    </ul>
  </Notice>
{/snippet}

{#snippet formFooter()}
  <div class="form-footer">
    {#if !isFirst}
      <Button.Root class="hb-button hb-button--paper" type="button" onclick={back} disabled={pending}>{t.onboarding.nav.back()}</Button.Root>
    {:else}
      <span></span>
    {/if}

    {#if isLast}
      <Button.Root class="hb-button hb-button--ink" type="button" disabled={pending} onclick={onSubmit}>
        {pending ? t.onboarding.nav.submitPending() : mode === "edit" ? t.onboarding.nav.submitEdit() : t.onboarding.nav.submit()}
      </Button.Root>
    {:else}
      <Button.Root class="hb-button hb-button--ink" type="button" disabled={!canProceed} onclick={next}>
        {t.onboarding.nav.next()}
      </Button.Root>
    {/if}
  </div>
{/snippet}
