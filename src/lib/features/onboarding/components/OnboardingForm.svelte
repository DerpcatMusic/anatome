<script lang="ts">
  import { api } from "$convex/_generated/api";
  import { useConvexClient } from "convex-svelte";

  import { useI18n } from "$lib/i18n/runes.svelte";
  import {
    goalOptions,
    normalizeEquipmentId,
    pathologyOptions,
    type Equipment,
    type Goal,
    type Pathology,
  } from "$lib/labels";
  import {
    emptyHealthDeclarationAnswers,
    hasHealthDeclarationYes,
    isHealthDeclarationComplete,
    normalizeHealthDeclarationAnswers,
    type HealthDeclarationAnswers,
  } from "$lib/features/onboarding/health-declaration";
  import { Button } from "bits-ui";
  import Notice from "$components/ui/Notice.svelte";
  import ExperienceStep from "./steps/ExperienceStep.svelte";
  import EquipmentStep from "./steps/EquipmentStep.svelte";
  import GoalsStep from "./steps/GoalsStep.svelte";
  import NotesStep from "./steps/NotesStep.svelte";
  import HealthDeclarationStep from "./steps/HealthDeclarationStep.svelte";
  import SummaryStep from "./steps/SummaryStep.svelte";
  import NameStep from "./steps/NameStep.svelte";
  import { displayNameForOnboardingPrefill } from "$lib/features/onboarding/display-name";
  import "./OnboardingForm.css";

  let {
    redirectTo,
    initialProfile,
    initialDisplayName,
    mode = "onboarding",
    onSaved,
  }: {
    redirectTo?: string;
    initialDisplayName?: string | null;
    mode?: "onboarding" | "edit";
    onSaved?: () => void;
    initialProfile?: {
      equipment: string[];
      experience: "new" | "some" | "steady";
      goals: string[];
      pathologies?: string[];
      notes: string;
      healthDeclarationAnswers?: Record<string, "yes" | "no">;
    };
  } = $props();

  const { t } = useI18n();
  const client = useConvexClient();

  const steps = [
    { id: "name" as const, title: t.onboarding.name.title(), subtitle: t.onboarding.name.subtitle() },
    { id: "experience" as const, title: t.onboarding.experience.title(), subtitle: t.onboarding.experience.subtitle() },
    { id: "equipment" as const, title: t.onboarding.equipment.title(), subtitle: t.onboarding.equipment.subtitle() },
    { id: "goals" as const, title: t.onboarding.goals.title(), subtitle: t.onboarding.goals.subtitle() },
    { id: "notes" as const, title: t.onboarding.notes.title(), subtitle: "" },
    { id: "health-declaration" as const, title: t.onboarding.healthDeclaration.title(), subtitle: t.onboarding.healthDeclaration.subtitle() },
    { id: "summary" as const, title: t.onboarding.summary.title(), subtitle: t.onboarding.summary.subtitle() },
  ] as const;

  let stepIndex = $state(0);
  let firstName = $state("");
  let lastName = $state("");
  let nameWarning = $state(false);
  let equipment = $state<Equipment[]>(["mat"]);
  let goals = $state<Goal[]>(["pelvic_floor_rehab"]);
  let experience = $state<"new" | "some" | "steady">("some");
  let pathologies = $state<Pathology[]>([]);
  let notes = $state("");
  let healthDeclarationAnswers = $state<HealthDeclarationAnswers>(emptyHealthDeclarationAnswers());
  let healthInfoConsent = $state(false);
  let healthDeclarationAccepted = $state(false);
  let pending = $state(false);
  let error = $state("");
  let submitted = $state(false);

  const pathologyIds = new Set(pathologyOptions.map(([id]) => id));

  function isKnownGoal(value: string): value is Goal {
    return goalOptions.some(([id]) => id === value);
  }

  function isKnownPathology(value: string): value is Pathology {
    return pathologyIds.has(value as Pathology);
  }

  const legacyGoalMap: Record<string, Goal> = {
    strength: "functional_daily",
    mobility: "stress_breathing",
    posture: "functional_daily",
    back_care: "back_pathology",
    return_to_movement: "functional_daily",
  };

  function normalizeGoal(value: string): Goal | null {
    if (isKnownGoal(value)) return value;
    return legacyGoalMap[value] ?? null;
  }

  $effect(() => {
    const prefilled = displayNameForOnboardingPrefill(initialDisplayName);
    firstName = prefilled.firstName;
    lastName = prefilled.lastName;
    nameWarning = false;

    equipment = initialProfile?.equipment
      ?.map((item) => normalizeEquipmentId(item))
      .filter((item): item is Equipment => item !== null) ?? ["mat"];
    goals = initialProfile?.goals
      ?.map(normalizeGoal)
      .filter((goal): goal is Goal => goal !== null) ?? ["pelvic_floor_rehab"];
    experience = initialProfile?.experience ?? "some";
    pathologies = initialProfile?.pathologies?.filter(isKnownPathology) ?? [];
    notes = initialProfile?.notes ?? "";

    if (initialProfile?.healthDeclarationAnswers) {
      healthDeclarationAnswers = {
        ...emptyHealthDeclarationAnswers(),
        ...initialProfile.healthDeclarationAnswers,
      };
    } else {
      healthDeclarationAnswers = emptyHealthDeclarationAnswers();
    }

    healthInfoConsent =
      (initialProfile?.pathologies?.length ?? 0) > 0 ||
      (initialProfile?.notes?.trim().length ?? 0) > 0 ||
      (initialProfile?.healthDeclarationAnswers
        ? Object.values(initialProfile.healthDeclarationAnswers).some((answer) => answer === "yes")
        : false);
    healthDeclarationAccepted = mode === "edit";
    stepIndex = 0;
    error = "";
    submitted = false;
  });

  const currentStep = $derived(steps[stepIndex]);
  const isFirst = $derived(stepIndex === 0);
  const isLast = $derived(stepIndex === steps.length - 1);
  const progressPercent = $derived(((stepIndex + 1) / steps.length) * 100);

  const needsHealthConsent = $derived(
    pathologies.length > 0 ||
      notes.trim().length > 0 ||
      hasHealthDeclarationYes(healthDeclarationAnswers),
  );

  const nameComplete = $derived(firstName.trim().length > 0 && lastName.trim().length > 0);

  const canProceed = $derived(
    currentStep.id === "name"
      ? nameComplete
      : currentStep.id === "equipment"
        ? equipment.length > 0
        : currentStep.id === "goals"
          ? goals.length > 0
          : currentStep.id === "health-declaration"
            ? isHealthDeclarationComplete(healthDeclarationAnswers) &&
              healthDeclarationAccepted &&
              (!needsHealthConsent || healthInfoConsent)
            : true,
  );

  function next() {
    if (currentStep.id === "name" && !nameComplete) {
      nameWarning = true;
      return;
    }
    if (!canProceed) return;
    error = "";
    nameWarning = false;
    if (!isLast) stepIndex++;
  }

  function back() {
    error = "";
    if (!isFirst) stepIndex--;
  }

  async function submit() {
    if (!nameComplete) {
      nameWarning = true;
      stepIndex = 0;
      return;
    }
    pending = true;
    error = "";
    try {
      const normalizedAnswers = normalizeHealthDeclarationAnswers(healthDeclarationAnswers);
      if (normalizedAnswers === null) {
        throw new Error(t.onboarding.healthDeclaration.incompleteError());
      }

      await client.mutation(api.users.onboarding.complete, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        equipment,
        experience,
        goals,
        pathologies,
        notes,
        healthDeclarationAnswers: normalizedAnswers,
        healthInfoConsent,
        healthDeclarationAccepted,
      });
      if (mode === "edit") {
        onSaved?.();
        pending = false;
        return;
      }
      submitted = true;
      const target = redirectTo ?? "/u/dashboard";
      setTimeout(() => window.location.assign(target), 800);
    } catch (reason) {
      error = reason instanceof Error ? reason.message : t.onboarding.saveError();
      pending = false;
    }
  }
</script>

{#if submitted}
  <div class="success">
    <div class="success-mark">✦</div>
    <h2>{mode === "edit" ? t.onboarding.success.editTitle() : t.onboarding.success.title()}</h2>
    <p>{mode === "edit" ? t.onboarding.success.editSubtitle() : t.onboarding.success.subtitle()}</p>
  </div>
{:else}
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
          <div class="progress-bar" role="progressbar" aria-valuenow={stepIndex + 1} aria-valuemin={1} aria-valuemax={steps.length} aria-label={t.onboarding.step()}>
            <div class="progress-bar__fill" style="width: {progressPercent}%"></div>
          </div>
          <div class="progress-label">{t.onboarding.step()} {stepIndex + 1} {t.onboarding.stepCount()}</div>
        {/if}

        <div class="form-body">
          {#if currentStep.id === "name"}
            <NameStep bind:firstName bind:lastName showWarning={nameWarning} />
          {:else if currentStep.id === "experience"}
            <ExperienceStep bind:experience />
          {:else if currentStep.id === "equipment"}
            <EquipmentStep bind:equipment />
          {:else if currentStep.id === "goals"}
            <GoalsStep bind:goals />
          {:else if currentStep.id === "notes"}
            <NotesStep bind:pathologies bind:notes />
          {:else if currentStep.id === "health-declaration"}
            <HealthDeclarationStep
              bind:answers={healthDeclarationAnswers}
              bind:healthInfoConsent
              bind:healthDeclarationAccepted
              {needsHealthConsent}
            />
          {:else if currentStep.id === "summary"}
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

          {#if error}
            <Notice tone="danger">{error}</Notice>
          {/if}
        </div>

        <div class="form-footer">
          {#if !isFirst}
            <Button.Root class="hb-button hb-button--paper" type="button" onclick={back} disabled={pending}>{t.onboarding.nav.back()}</Button.Root>
          {:else}
            <span></span>
          {/if}

          {#if isLast}
            <Button.Root class="hb-button hb-button--ink" type="button" disabled={pending || !canProceed || !nameComplete} onclick={submit}>
              {pending ? t.onboarding.nav.submitPending() : mode === "edit" ? t.onboarding.nav.submitEdit() : t.onboarding.nav.submit()}
            </Button.Root>
          {:else}
            <Button.Root class="hb-button hb-button--ink" type="button" disabled={!canProceed} onclick={next}>
              {t.onboarding.nav.next()}
            </Button.Root>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}
