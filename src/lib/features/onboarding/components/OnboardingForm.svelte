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
  import { Button } from "bits-ui";
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
  const client = useConvexClient();

  const steps = [
    { id: "experience" as const, title: t.onboarding.experience.title(), subtitle: t.onboarding.experience.subtitle() },
    { id: "equipment-goals" as const, title: t.onboarding.equipment.title(), subtitle: t.onboarding.equipment.subtitle() },
    { id: "notes-summary" as const, title: t.onboarding.notes.title(), subtitle: t.onboarding.notes.subtitle() },
  ] as const;

  type StepId = (typeof steps)[number]["id"];

  let stepIndex = $state(0);
  let equipment = $state<Equipment[]>(["mat"]);
  let goals = $state<Goal[]>(["strength"]);
  let experience = $state<"new" | "some" | "steady">("some");
  let notes = $state("");
  let healthInfoConsent = $state(false);
  let healthDeclarationAccepted = $state(false);
  let pending = $state(false);
  let error = $state("");
  let submitted = $state(false);

  $effect(() => {
    equipment = initialProfile?.equipment?.filter((e): e is Equipment => equipmentOptions.some(([id]) => id === e)) ?? ["mat"];
    goals = initialProfile?.goals?.filter((g): g is Goal => goalOptions.some(([id]) => id === g)) ?? ["strength"];
    experience = initialProfile?.experience ?? "some";
    notes = initialProfile?.notes ?? "";
    healthInfoConsent = (initialProfile?.notes?.trim().length ?? 0) > 0;
    healthDeclarationAccepted = mode === "edit";
    stepIndex = 0;
    error = "";
    submitted = false;
  });

  const currentStep = $derived(steps[stepIndex]);
  const isFirst = $derived(stepIndex === 0);
  const isLast = $derived(stepIndex === steps.length - 1);

  const progressPercent = $derived(((stepIndex + 1) / steps.length) * 100);

  const canProceed = $derived(
    currentStep.id === "equipment-goals"
      ? equipment.length > 0 && goals.length > 0
      : currentStep.id === "notes-summary"
        ? healthDeclarationAccepted && (notes.trim().length === 0 || healthInfoConsent)
      : true
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
      await client.mutation(api.users.onboarding.complete, {
        equipment, experience, goals, notes, healthInfoConsent, healthDeclarationAccepted,
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
        <div class="question">
          <h1>{currentStep.title}</h1>
          <p>{currentStep.subtitle}</p>
        </div>
      </div>
    </div>

    <!-- Left panel: form (white) — SECOND in DOM → column 2 = LEFT in RTL -->
    <div class="panel panel--form">
      <div class="panel__inner">
        {#if mode === "onboarding"}
          <div class="progress-bar" role="progressbar" aria-valuenow={stepIndex + 1} aria-valuemin={1} aria-valuemax={steps.length} aria-label={t.onboarding.step()}>
            <div class="progress-bar__fill" style="width: {progressPercent}%"></div>
          </div>
          <div class="progress-label">{t.onboarding.step()} {stepIndex + 1} {t.onboarding.stepCount()}</div>
        {/if}

        <div class="form-body">
          {#if currentStep.id === "experience"}
            <ExperienceStep bind:experience />
          {:else if currentStep.id === "equipment-goals"}
            <div class="combo-section">
              <p class="combo-section__label">{t.onboarding.equipment.title()}</p>
              <EquipmentStep bind:equipment />
            </div>
            <div class="combo-section">
              <p class="combo-section__label">{t.onboarding.goals.title()}</p>
              <GoalsStep bind:goals />
            </div>
          {:else if currentStep.id === "notes-summary"}
            <NotesStep bind:notes />
            <div class="privacy-consent" data-active={notes.trim().length > 0}>
              <p>
                השדה הזה אופציונלי ועשוי לכלול מידע רגיש כמו כאב, פציעה, הריון, ניתוח או מגבלה רפואית.
                המידע נשמר רק כדי להתאים לך תרגול ולייבים, ואינו מחליף ייעוץ רפואי.
              </p>
              <label class="privacy-consent__check">
                <input type="checkbox" bind:checked={healthInfoConsent} disabled={notes.trim().length === 0} />
                <span>אני מסכימ/ה לשמירת המידע שמסרתי לצורך התאמת פעילות.</span>
              </label>
            </div>
            <div class="health-declaration">
              <p>
                הצהרת בריאות: הפעילות אינה טיפול רפואי או פיזיותרפיה. אם יש כאב חד, פציעה פעילה,
                הריון, אחרי לידה, ניתוח, בעיית לב, לחץ דם, סחרחורת או מגבלה רפואית — יש להתייעץ
                עם גורם רפואי מוסמך לפני התחלה ולעצור מיד אם יש החמרה או תחושה חריגה.
              </p>
              <label class="privacy-consent__check">
                <input type="checkbox" bind:checked={healthDeclarationAccepted} />
                <span>קראתי ואני מאשר/ת שהפעילות מתאימה לי או שהתייעצתי עם גורם רפואי כנדרש.</span>
              </label>
            </div>
            <SummaryStep {experience} {equipment} {goals} />
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
            <Button.Root class="hb-button hb-button--ink" type="button" disabled={pending || !canProceed} onclick={submit}>
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
