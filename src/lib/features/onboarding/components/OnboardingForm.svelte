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
      await client.mutation(api.users.completeOnboarding, {
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

<style>
  /* ─── Layout: edge-to-edge, full height, 2 equal panes ─── */
  .onboarding {
    display: grid;
    grid-template-columns: 1fr 1fr;
    min-height: calc(100vh - 56px);
    align-items: start; /* panels size independently — no cross-panel stretch */
  }

  /* In RTL: first child → column 1 = RIGHT side */
  /* second child → column 2 = LEFT side */

  .panel {
    display: flex;
    flex-direction: column;
    min-height: calc(100vh - 56px);
    contain: layout; /* isolate layout changes from sibling panel */
  }

  .panel__inner {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: clamp(32px, 5vw, 64px) clamp(24px, 4vw, 56px);
  }

  /* ─── Right panel: question + beige mesh ─── */
  .panel--question {
    background-color: var(--paper);
    background-image:
      radial-gradient(ellipse 70% 50% at 20% 30%, color-mix(in srgb, var(--sky) 35%, transparent), transparent 55%),
      radial-gradient(ellipse 50% 70% at 80% 20%, color-mix(in srgb, var(--beige) 40%, transparent), transparent 50%),
      radial-gradient(ellipse 60% 40% at 50% 80%, color-mix(in srgb, var(--sky-soft) 28%, transparent), transparent 50%);
    background-size: 180% 180%;
    animation: mesh-drift 24s ease-in-out infinite alternate;
  }

  @keyframes mesh-drift {
    0% { background-position: 0% 0%, 100% 0%, 50% 100%; }
    50% { background-position: 8% 12%, 92% 8%, 48% 92%; }
    100% { background-position: 15% 5%, 85% 15%, 45% 85%; }
  }

  .progress-dots {
    display: flex;
    gap: var(--space-3);
    margin-bottom: auto;
  }

  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: var(--border);
    background: var(--white);
    cursor: pointer;
    padding: 0;
    transition: background var(--duration-fast), transform var(--duration-fast);
  }

  .dot.active {
    background: var(--ink);
    border-color: var(--ink);
    transform: scale(1.15);
  }

  .dot.done {
    background: var(--ink);
    border-color: var(--ink);
  }

  .dot:disabled {
    cursor: default;
    opacity: 0.3;
  }

  .question {
    margin-top: auto;
    margin-bottom: auto;
    padding-bottom: var(--space-8);
  }

  .question__num {
    font-family: var(--font-mono);
    font-size: var(--step--1);
    color: var(--muted);
    display: block;
    margin-bottom: var(--space-4);
  }

  .question h1 {
    font-size: var(--step-3);
    line-height: 1.05;
    margin: 0 0 var(--space-4);
  }

  .question p {
    font-size: var(--step-1);
    color: var(--muted);
    line-height: 1.5;
    max-width: 36ch;
    margin: 0;
  }

  /* ─── Left panel: form + white ─── */
  .panel--form {
    background: var(--white);
  }

  .form-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
    overflow-y: auto;
    min-height: 360px; /* lock minimum so short steps don't collapse */
    padding-bottom: var(--space-4);
  }

  .form-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: var(--space-6);
    border-top: var(--border);
    flex-shrink: 0;
  }

  /* ─── Success ─── */
  .success {
    display: grid;
    place-content: center;
    text-align: center;
    gap: var(--space-3);
    min-height: 60vh;
    padding: var(--space-7);
  }

  .success-mark {
    font-size: var(--step-4);
    color: var(--sky-strong);
    line-height: 1;
  }

  .success h2 {
    font-size: var(--step-3);
  }

  .success p {
    color: var(--muted);
    font-size: var(--step-1);
  }

  /* ─── Mobile ─── */
  @media (max-width: 860px) {
    .onboarding {
      grid-template-columns: 1fr;
    }

    .panel--question {
      min-height: 30vh;
      border-block-end: var(--border);
    }

    .panel__inner {
      padding: var(--space-5) clamp(20px, 4vw, 32px);
    }

    .question {
      margin-top: 0;
      margin-bottom: 0;
      padding-bottom: 0;
    }

    .question h1 {
      font-size: var(--step-2);
    }
  }
</style>
