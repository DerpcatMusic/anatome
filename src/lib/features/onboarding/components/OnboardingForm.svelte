<script lang="ts">
  import { api } from "$convex/_generated/api";
  import { useConvexClient } from "convex-svelte";

  import { useI18n } from "$lib/i18n/runes.svelte";
  import {
    equipmentOptions,
    goalOptions,
    type Equipment,
    type Goal,
  } from "$lib/labels";
  import Button from "$components/ui/Button.svelte";
  import Notice from "$components/ui/Notice.svelte";
  import ExperienceStep from "./steps/ExperienceStep.svelte";
  import EquipmentStep from "./steps/EquipmentStep.svelte";
  import GoalsStep from "./steps/GoalsStep.svelte";
  import NotesStep from "./steps/NotesStep.svelte";
  import SummaryStep from "./steps/SummaryStep.svelte";
  import "./OnboardingForm.css";

  let {
    redirectTo,
    initialProfile,
    mode = "onboarding",
  }: {
    redirectTo?: string;
    mode?: "onboarding" | "edit";
    initialProfile?: {
      equipment: string[];
      experience: "new" | "some" | "steady";
      goals: string[];
      notes: string;
    };
  } = $props();

  const { t } = useI18n();

  const steps = [
    { id: "experience" as const },
    { id: "equipment" as const },
    { id: "goals" as const },
    { id: "notes" as const },
  ] as const;

  type StepId = (typeof steps)[number]["id"];

  let stepIndex = $state(0);
  let equipment = $state<Equipment[]>(["mat"]);
  let goals = $state<Goal[]>(["strength"]);
  let experience = $state<"new" | "some" | "steady">("some");
  let notes = $state("");
  let pending = $state(false);
  let error = $state("");
  let submitted = $state(false);

  $effect(() => {
    equipment = initialProfile?.equipment?.filter((e): e is Equipment => equipmentOptions.some(([id]) => id === e)) ?? ["mat"];
    goals = initialProfile?.goals?.filter((g): g is Goal => goalOptions.some(([id]) => id === g)) ?? ["strength"];
    experience = initialProfile?.experience ?? "some";
    notes = initialProfile?.notes ?? "";
    stepIndex = 0;
    error = "";
    submitted = false;
  });

  const currentStep = $derived(steps[stepIndex]);
  const isFirst = $derived(stepIndex === 0);
  const isLast = $derived(stepIndex === steps.length - 1);

  function getStepLabel(id: StepId): string {
    return (
      id === "experience" ? t.onboarding.stepLabels.experience() :
      id === "equipment" ? t.onboarding.stepLabels.equipment() :
      id === "goals" ? t.onboarding.stepLabels.goals() :
      t.onboarding.stepLabels.notes()
    );
  }

  const stepTitle = $derived(
    currentStep.id === "experience" ? t.onboarding.experience.title() :
    currentStep.id === "equipment" ? t.onboarding.equipment.title() :
    currentStep.id === "goals" ? t.onboarding.goals.title() :
    t.onboarding.notes.title()
  );

  const stepSubtitle = $derived(
    currentStep.id === "experience" ? t.onboarding.experience.subtitle() :
    currentStep.id === "equipment" ? t.onboarding.equipment.subtitle() :
    currentStep.id === "goals" ? t.onboarding.goals.subtitle() :
    t.onboarding.notes.subtitle()
  );

  const canProceed = $derived(
    currentStep.id === "equipment" ? equipment.length > 0 :
    currentStep.id === "goals" ? goals.length > 0 :
    true
  );

  function next() {
    if (!canProceed) return;
    error = "";
    if (!isLast) stepIndex++;
  }

  function back() {
    error = "";
    if (!isFirst) stepIndex--;
  }

  async function submit() {
    pending = true;
    error = "";
    try {
      const client = useConvexClient();
      await client.mutation(api.users.onboarding.complete, {
        equipment, experience, goals, notes,
      });
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
    <!-- Right panel: question (beige mesh) — FIRST in DOM → column 1 = RIGHT in RTL -->
    <div class="panel panel--question">
      <div class="panel__inner">
        {#if mode === "onboarding"}
          <div class="progress-dots">
            {#each steps as step, i}
              <button
                class="dot"
                class:active={i === stepIndex}
                class:done={i < stepIndex}
                onclick={() => { if (i < stepIndex) stepIndex = i; }}
                disabled={i > stepIndex}
                type="button"
                aria-label={getStepLabel(step.id)}
              ></button>
            {/each}
          </div>
        {/if}

        <div class="question">
          <span class="question__num">{String(stepIndex + 1).padStart(2, "0")}</span>
          <h1>{stepTitle}</h1>
          <p>{stepSubtitle}</p>
        </div>
      </div>
    </div>

    <!-- Left panel: form (white) — SECOND in DOM → column 2 = LEFT in RTL -->
    <div class="panel panel--form">
      <div class="panel__inner">
        <div class="form-body">
          {#if currentStep.id === "experience"}
            <ExperienceStep bind:experience />
          {:else if currentStep.id === "equipment"}
            <EquipmentStep bind:equipment />
          {:else if currentStep.id === "goals"}
            <GoalsStep bind:goals />
          {:else if currentStep.id === "notes"}
            <NotesStep bind:notes />
            <SummaryStep {experience} {equipment} {goals} />
          {/if}

          {#if error}
            <Notice tone="danger">{error}</Notice>
          {/if}
        </div>

        <div class="form-footer">
          {#if !isFirst}
            <Button tone="paper" size="sm" onclick={back} disabled={pending}>{t.onboarding.nav.back()}</Button>
          {:else}
            <span></span>
          {/if}

          {#if isLast}
            <Button type="button" tone="ink" disabled={pending || !canProceed} onclick={submit}>
              {pending ? t.onboarding.nav.submitPending() : mode === "edit" ? t.onboarding.nav.submitEdit() : t.onboarding.nav.submit()}
            </Button>
          {:else}
            <Button type="button" tone="ink" disabled={!canProceed} onclick={next}>
              {t.onboarding.nav.next()}
            </Button>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}

