<script lang="ts">
  import { api } from "$convex/_generated/api";
  import { authMutation } from "$lib/auth/session.svelte";

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
  import {
    clearOnboardingDraft,
    loadOnboardingDraft,
    saveOnboardingDraft,
  } from "$lib/features/onboarding/draft";
  import { convexMutationErrorMessage } from "$lib/convex/errors";
  import { browser } from "$app/environment";
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

  const steps = [
    { id: "name" as const, title: t.onboarding.name.title(), subtitle: t.onboarding.name.subtitle() },
    { id: "experience" as const, title: t.onboarding.experience.title(), subtitle: t.onboarding.experience.subtitle() },
    { id: "equipment" as const, title: t.onboarding.equipment.title(), subtitle: t.onboarding.equipment.subtitle() },
    { id: "goals" as const, title: t.onboarding.goals.title(), subtitle: t.onboarding.goals.subtitle() },
    { id: "notes" as const, title: t.onboarding.notes.title(), subtitle: t.onboarding.notes.subtitle() },
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
  let stepValidationAttempted = $state(false);
  let editValidationAttempted = $state(false);
  let draftHydrated = $state(false);

  function isKnownGoal(value: string): value is Goal {
    return goalOptions.some(([id]) => id === value);
  }

  function isKnownPathology(value: string): value is Pathology {
    return pathologyOptions.some(([id]) => id === value);
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

  function hydrateFromInitialProfile(profile: NonNullable<typeof initialProfile>) {
    equipment = profile.equipment
      .map((item) => normalizeEquipmentId(item))
      .filter((item): item is Equipment => item !== null);
    if (equipment.length === 0) equipment = ["mat"];

    goals = profile.goals
      .map(normalizeGoal)
      .filter((goal): goal is Goal => goal !== null);
    if (goals.length === 0) goals = ["pelvic_floor_rehab"];

    experience = profile.experience;
    pathologies = profile.pathologies?.filter(isKnownPathology) ?? [];
    notes = profile.notes ?? "";

    if (profile.healthDeclarationAnswers) {
      healthDeclarationAnswers = {
        ...emptyHealthDeclarationAnswers(),
        ...profile.healthDeclarationAnswers,
      };
    } else {
      healthDeclarationAnswers = emptyHealthDeclarationAnswers();
    }

    const hasSensitiveData =
      (profile.pathologies?.length ?? 0) > 0 ||
      (profile.notes?.trim().length ?? 0) > 0 ||
      (profile.healthDeclarationAnswers
        ? Object.values(profile.healthDeclarationAnswers).some((answer) => answer === "yes")
        : false);
    healthInfoConsent = mode === "edit" || hasSensitiveData;
    healthDeclarationAccepted = mode === "edit";
  }

  let profileHydrationKey = $state<string | null>(null);
  let displayNameHydrated = $state(false);

  /** Restore in-progress onboarding from localStorage (no server draft yet). */
  $effect(() => {
    if (mode !== "onboarding" || draftHydrated || initialProfile) return;
    draftHydrated = true;
    const draft = loadOnboardingDraft();
    if (draft === null) return;
    stepIndex = draft.stepIndex;
    firstName = draft.firstName;
    lastName = draft.lastName;
    equipment = draft.equipment as Equipment[];
    goals = draft.goals.filter(isKnownGoal) as Goal[];
    if (equipment.length === 0) equipment = ["mat"];
    if (goals.length === 0) goals = ["pelvic_floor_rehab"];
    experience = draft.experience;
    pathologies = draft.pathologies.filter(isKnownPathology);
    notes = draft.notes;
    healthDeclarationAnswers = draft.healthDeclarationAnswers;
    healthInfoConsent = draft.healthInfoConsent;
    healthDeclarationAccepted = draft.healthDeclarationAccepted;
  });

  $effect(() => {
    if (!browser || mode !== "onboarding" || submitted) return;
    const snapshot = {
      stepIndex,
      firstName,
      lastName,
      equipment,
      goals,
      experience,
      pathologies,
      notes,
      healthDeclarationAnswers,
      healthInfoConsent,
      healthDeclarationAccepted,
    };
    const handle = setTimeout(() => saveOnboardingDraft(snapshot), 400);
    return () => clearTimeout(handle);
  });

  /** Edit mode: hydrate once per profile snapshot — never reset mid-flow. */
  $effect(() => {
    if (!initialProfile) return;
    const key = JSON.stringify({
      equipment: initialProfile.equipment,
      experience: initialProfile.experience,
      goals: initialProfile.goals,
      pathologies: initialProfile.pathologies ?? [],
      notes: initialProfile.notes,
      healthDeclarationAnswers: initialProfile.healthDeclarationAnswers ?? null,
    });
    if (profileHydrationKey === key) return;
    profileHydrationKey = key;
    hydrateFromInitialProfile(initialProfile);
  });

  /** Prefill name once when display name arrives (OAuth or edit) — do not wipe other fields. */
  $effect(() => {
    if (displayNameHydrated || !initialDisplayName) return;
    const prefilled = displayNameForOnboardingPrefill(initialDisplayName);
    if (firstName.trim() === "" && lastName.trim() === "") {
      firstName = prefilled.firstName;
      lastName = prefilled.lastName;
    }
    displayNameHydrated = true;
  });

  const currentStep = $derived(steps[stepIndex]);
  const isFirst = $derived(stepIndex === 0);
  const isLast = $derived(stepIndex === steps.length - 1);
  const progressPercent = $derived(((stepIndex + 1) / steps.length) * 100);

  /** Existing members editing profile — no health/consent re-prompt. */
  const isMemberProfileUpdate = $derived(mode === "edit" && initialProfile !== undefined);

  /** Health declaration answers are always stored — consent is required on this step. */
  const needsHealthConsent = $derived(
    currentStep.id === "health-declaration" ||
      pathologies.length > 0 ||
      notes.trim().length > 0 ||
      hasHealthDeclarationYes(healthDeclarationAnswers),
  );

  const nameComplete = $derived(firstName.trim().length > 0 && lastName.trim().length > 0);

  const healthComplete = $derived(isHealthDeclarationComplete(healthDeclarationAnswers));
  const healthConsentsComplete = $derived(
    healthDeclarationAccepted && healthInfoConsent,
  );

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

  const readyToSubmitProfileEdit = $derived(
    nameComplete && equipment.length > 0 && goals.length > 0,
  );

  function stepIsIncomplete(stepId: (typeof steps)[number]["id"]): boolean {
    switch (stepId) {
      case "name":
        return !nameComplete;
      case "equipment":
        return equipment.length === 0;
      case "goals":
        return goals.length === 0;
      case "health-declaration":
        return !healthComplete || !healthConsentsComplete;
      default:
        return false;
    }
  }

  function stepBlockReason(stepId: (typeof steps)[number]["id"]): string | null {
    switch (stepId) {
      case "name":
        return nameComplete ? null : t.onboarding.name.emptyWarning();
      case "equipment":
        return equipment.length > 0 ? null : t.onboarding.equipment.emptyWarning();
      case "goals":
        return goals.length > 0 ? null : t.onboarding.goals.emptyWarning();
      case "health-declaration":
        if (!healthComplete) return t.onboarding.healthDeclaration.incompleteError();
        if (!healthDeclarationAccepted) {
          return "יש לאשר את הצהרת נכונות המידע.";
        }
        if (!healthInfoConsent) {
          return "יש לאשר את הסכמת שמירת המידע הבריאותי.";
        }
        return null;
      default:
        return null;
    }
  }

  const footerBlockReason = $derived.by(() => {
    if (!stepValidationAttempted || canProceed) return null;
    return stepBlockReason(currentStep.id);
  });

  function goToStep(index: number) {
    if (index < 0 || index >= steps.length) return;
    stepIndex = index;
    stepValidationAttempted = false;
    error = "";
    nameWarning = false;
  }

  function next() {
    stepValidationAttempted = true;
    if (currentStep.id === "name" && !nameComplete) {
      nameWarning = true;
      return;
    }
    if (!canProceed) return;
    error = "";
    nameWarning = false;
    stepValidationAttempted = false;
    if (!isLast) stepIndex++;
  }

  function back() {
    error = "";
    stepValidationAttempted = false;
    if (!isFirst) stepIndex--;
  }

  const healthDeclarationStepIndex = steps.findIndex((s) => s.id === "health-declaration");

  async function submit() {
    if (pending || submitted) return;
    if (mode === "edit") {
      editValidationAttempted = true;
    } else {
      stepValidationAttempted = true;
    }

    if (!nameComplete) {
      nameWarning = true;
      goToStep(0);
      return;
    }

    if (equipment.length === 0) {
      error = t.onboarding.equipment.emptyWarning();
      goToStep(steps.findIndex((s) => s.id === "equipment"));
      return;
    }

    if (goals.length === 0) {
      error = t.onboarding.goals.emptyWarning();
      goToStep(steps.findIndex((s) => s.id === "goals"));
      return;
    }

    if (isMemberProfileUpdate) {
      pending = true;
      error = "";
      try {
        await authMutation(api.users.profile.updateMember, {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          equipment,
          experience,
          goals,
          pathologies,
          notes,
        });
        onSaved?.();
        pending = false;
        return;
      } catch (reason) {
        error = convexMutationErrorMessage(reason, t.onboarding.saveError());
        pending = false;
        return;
      }
    }

    const normalizedAnswers = normalizeHealthDeclarationAnswers(healthDeclarationAnswers);
    if (normalizedAnswers === null) {
      error = t.onboarding.healthDeclaration.incompleteError();
      if (healthDeclarationStepIndex >= 0) goToStep(healthDeclarationStepIndex);
      return;
    }

    if (!healthDeclarationAccepted || !healthInfoConsent) {
      error = "נדרשת הסכמה לשמירת מידע בריאותי והצהרת בריאות.";
      if (healthDeclarationStepIndex >= 0) goToStep(healthDeclarationStepIndex);
      return;
    }

    pending = true;
    error = "";
    try {
      await authMutation(api.users.onboarding.complete, {
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
      clearOnboardingDraft();
      submitted = true;
      const target = redirectTo ?? "/u/dashboard";
      setTimeout(() => window.location.assign(target), 800);
    } catch (reason) {
      error = convexMutationErrorMessage(reason, t.onboarding.saveError());
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
{:else if mode === "edit"}
  <form
    class="profile-edit"
    onsubmit={(event) => {
      event.preventDefault();
      void submit();
    }}
  >
    {#if error}
      <Notice tone="danger">{error}</Notice>
    {/if}

    {#if editValidationAttempted && !(isMemberProfileUpdate ? readyToSubmitProfileEdit : readyToSubmit)}
      <Notice tone="neutral">
        <p>לפני שמירה, יש להשלים:</p>
        <ul class="onboarding-missing-list">
          {#if !nameComplete}
            <li>שם מלא</li>
          {/if}
          {#if equipment.length === 0}
            <li>בחירת ציוד</li>
          {/if}
          {#if goals.length === 0}
            <li>בחירת מטרות</li>
          {/if}
          {#if !isMemberProfileUpdate && (!healthComplete || !healthConsentsComplete)}
            <li>הצהרת בריאות והסכמות</li>
          {/if}
        </ul>
      </Notice>
    {/if}

    <section class="profile-edit__section" aria-labelledby="profile-edit-name">
      <h2 id="profile-edit-name" class="profile-edit__title">{t.onboarding.name.title()}</h2>
      {#if t.onboarding.name.subtitle()}
        <p class="profile-edit__subtitle">{t.onboarding.name.subtitle()}</p>
      {/if}
      <NameStep
        bind:firstName
        bind:lastName
        showWarning={editValidationAttempted && !nameComplete}
      />
    </section>

    <section class="profile-edit__section" aria-labelledby="profile-edit-experience">
      <h2 id="profile-edit-experience" class="profile-edit__title">{t.onboarding.experience.title()}</h2>
      {#if t.onboarding.experience.subtitle()}
        <p class="profile-edit__subtitle">{t.onboarding.experience.subtitle()}</p>
      {/if}
      <ExperienceStep bind:experience />
    </section>

    <section class="profile-edit__section" aria-labelledby="profile-edit-equipment">
      <h2 id="profile-edit-equipment" class="profile-edit__title">{t.onboarding.equipment.title()}</h2>
      {#if t.onboarding.equipment.subtitle()}
        <p class="profile-edit__subtitle">{t.onboarding.equipment.subtitle()}</p>
      {/if}
      <EquipmentStep
        bind:equipment
        showWarning={editValidationAttempted && equipment.length === 0}
      />
    </section>

    <section class="profile-edit__section" aria-labelledby="profile-edit-goals">
      <h2 id="profile-edit-goals" class="profile-edit__title">{t.onboarding.goals.title()}</h2>
      {#if t.onboarding.goals.subtitle()}
        <p class="profile-edit__subtitle">{t.onboarding.goals.subtitle()}</p>
      {/if}
      <GoalsStep bind:goals showWarning={editValidationAttempted && goals.length === 0} />
    </section>

    <section class="profile-edit__section" aria-labelledby="profile-edit-notes">
      <h2 id="profile-edit-notes" class="profile-edit__title">{t.onboarding.notes.title()}</h2>
      {#if t.onboarding.notes.subtitle()}
        <p class="profile-edit__subtitle">{t.onboarding.notes.subtitle()}</p>
      {/if}
      <NotesStep bind:pathologies bind:notes />
    </section>

    {#if !isMemberProfileUpdate}
      <section class="profile-edit__section" aria-labelledby="profile-edit-health">
        <h2 id="profile-edit-health" class="profile-edit__title">{t.onboarding.healthDeclaration.title()}</h2>
        {#if t.onboarding.healthDeclaration.subtitle()}
          <p class="profile-edit__subtitle">{t.onboarding.healthDeclaration.subtitle()}</p>
        {/if}
        <HealthDeclarationStep
          bind:answers={healthDeclarationAnswers}
          bind:healthInfoConsent
          bind:healthDeclarationAccepted
          {needsHealthConsent}
          showValidation={editValidationAttempted && (!healthComplete || !healthConsentsComplete)}
        />
      </section>
    {/if}

    <div class="profile-edit__actions">
      <Button.Root class="hb-button hb-button--ink" type="submit" disabled={pending}>
        {pending ? t.onboarding.nav.submitPending() : t.onboarding.nav.submitEdit()}
      </Button.Root>
    </div>
  </form>
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
          <nav class="step-nav" aria-label="שלבי ההרשמה">
            {#each steps as step, index (step.id)}
              <button
                type="button"
                class="step-nav__item"
                class:step-nav__item--current={index === stepIndex}
                class:step-nav__item--incomplete={stepIsIncomplete(step.id)}
                aria-current={index === stepIndex ? "step" : undefined}
                onclick={() => goToStep(index)}
              >
                <span class="step-nav__index">{index + 1}</span>
                <span class="step-nav__label">{step.title}</span>
              </button>
            {/each}
          </nav>
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
              {needsHealthConsent}
              showValidation={stepValidationAttempted && !canProceed}
            />
          {:else if currentStep.id === "summary"}
            {#if stepValidationAttempted && !readyToSubmit}
              <Notice tone="neutral">
                <p>לפני שמירה, יש להשלים:</p>
                <ul class="onboarding-missing-list">
                  {#if !nameComplete}
                    <li>
                      <button type="button" class="onboarding-missing-link" onclick={() => goToStep(0)}>
                        שם מלא
                      </button>
                    </li>
                  {/if}
                  {#if equipment.length === 0}
                    <li>
                      <button
                        type="button"
                        class="onboarding-missing-link"
                        onclick={() => goToStep(steps.findIndex((s) => s.id === "equipment"))}
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
                        onclick={() => goToStep(steps.findIndex((s) => s.id === "goals"))}
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
                        onclick={() => goToStep(healthDeclarationStepIndex)}
                      >
                        הצהרת בריאות והסכמות
                      </button>
                    </li>
                  {/if}
                </ul>
              </Notice>
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

        <div class="form-footer">
          {#if !isFirst}
            <Button.Root class="hb-button hb-button--paper" type="button" onclick={back} disabled={pending}>{t.onboarding.nav.back()}</Button.Root>
          {:else}
            <span></span>
          {/if}

          {#if isLast}
            <Button.Root class="hb-button hb-button--ink" type="button" disabled={pending} onclick={submit}>
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
