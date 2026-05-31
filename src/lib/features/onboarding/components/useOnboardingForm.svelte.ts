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
import { displayNameForOnboardingPrefill } from "$lib/features/onboarding/display-name";
import {
  clearOnboardingDraft,
  loadOnboardingDraft,
  saveOnboardingDraft,
} from "$lib/features/onboarding/draft";
import { convexMutationErrorMessage } from "$lib/convex/errors";
import { browser } from "$app/environment";
import { useDebounce } from "runed";

export interface OnboardingProfile {
  equipment: string[];
  experience: "new" | "some" | "steady";
  goals: string[];
  pathologies?: string[];
  notes: string;
  healthDeclarationAnswers?: Record<string, "yes" | "no">;
}

export function useOnboardingForm(
  mode: "onboarding" | "edit",
  initialProfile: OnboardingProfile | undefined,
  initialDisplayName: string | null | undefined,
  redirectTo: string | undefined,
  onSaved: (() => void) | undefined,
) {
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
  let profileHydrationKey = $state<string | null>(null);
  let displayNameHydrated = $state(false);

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

  function hydrateFromInitialProfile(profile: OnboardingProfile) {
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

  const _saveDraft = useDebounce(
    (snapshot: Parameters<typeof saveOnboardingDraft>[0]) => saveOnboardingDraft(snapshot),
    400,
  );

  $effect(() => {
    if (!browser || mode !== "onboarding" || submitted) return;
    const snapshot = {
      stepIndex, firstName, lastName, equipment, goals, experience,
      pathologies, notes, healthDeclarationAnswers, healthInfoConsent, healthDeclarationAccepted,
    };
    _saveDraft(snapshot);
    return () => _saveDraft.cancel();
  });

  $effect(() => {
    if (!initialProfile) return;
    const key = JSON.stringify({
      equipment: initialProfile.equipment, experience: initialProfile.experience,
      goals: initialProfile.goals, pathologies: initialProfile.pathologies ?? [],
      notes: initialProfile.notes,
      healthDeclarationAnswers: initialProfile.healthDeclarationAnswers ?? null,
    });
    if (profileHydrationKey === key) return;
    profileHydrationKey = key;
    hydrateFromInitialProfile(initialProfile);
  });

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
  const isMemberProfileUpdate = $derived(mode === "edit" && initialProfile !== undefined);

  const needsHealthConsent = $derived(
    currentStep.id === "health-declaration" ||
      pathologies.length > 0 ||
      notes.trim().length > 0 ||
      hasHealthDeclarationYes(healthDeclarationAnswers),
  );

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
    nameComplete && equipment.length > 0 && goals.length > 0 &&
      healthComplete && healthDeclarationAccepted && healthInfoConsent,
  );

  const readyToSubmitProfileEdit = $derived(
    nameComplete && equipment.length > 0 && goals.length > 0,
  );

  function goToStep(index: number) {
    if (index < 0 || index >= steps.length) return;
    stepIndex = index;
    stepValidationAttempted = false;
    error = "";
    nameWarning = false;
  }

  const handleGoToStep = (index: number) => () => goToStep(index);

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

    const healthDeclarationStepIndex = steps.findIndex((s) => s.id === "health-declaration");

    if (isMemberProfileUpdate) {
      pending = true;
      error = "";
      try {
        await authMutation(api.users.profile.updateMember, {
          firstName: firstName.trim(), lastName: lastName.trim(),
          equipment, experience, goals, pathologies, notes,
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
        firstName: firstName.trim(), lastName: lastName.trim(),
        equipment, experience, goals, pathologies, notes,
        healthDeclarationAnswers: normalizedAnswers,
        healthInfoConsent, healthDeclarationAccepted,
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

  return {
    steps,
    stepIndex,
    firstName,
    lastName,
    nameWarning,
    equipment,
    goals,
    experience,
    pathologies,
    notes,
    healthDeclarationAnswers,
    healthInfoConsent,
    healthDeclarationAccepted,
    pending,
    error,
    submitted,
    stepValidationAttempted,
    editValidationAttempted,
    currentStep,
    isFirst,
    isLast,
    isMemberProfileUpdate,
    needsHealthConsent,
    nameComplete,
    healthComplete,
    healthConsentsComplete,
    canProceed,
    readyToSubmit,
    readyToSubmitProfileEdit,
    goToStep,
    handleGoToStep,
    next,
    back,
    submit,
  };
}
