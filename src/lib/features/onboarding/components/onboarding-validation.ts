import { useI18n } from "$lib/i18n/runes.svelte";
import {
  hasHealthDeclarationYes,
  isHealthDeclarationComplete,
} from "$lib/features/onboarding/health-declaration";
import type { HealthDeclarationAnswers } from "$lib/features/onboarding/health-declaration";

type StepId =
  | "name"
  | "experience"
  | "equipment"
  | "goals"
  | "notes"
  | "health-declaration"
  | "summary";

export interface OnboardingValidationDeps {
  firstName: string;
  lastName: string;
  equipment: string[];
  goals: string[];
  healthDeclarationAnswers: HealthDeclarationAnswers;
  healthDeclarationAccepted: boolean;
  healthInfoConsent: boolean;
  healthComplete: boolean;
  healthConsentsComplete: boolean;
  nameComplete: boolean;
}

export function useOnboardingValidation(deps: () => OnboardingValidationDeps) {
  const { t } = useI18n();

  function stepIsIncomplete(stepId: StepId): boolean {
    const d = deps();
    switch (stepId) {
      case "name":
        return !d.nameComplete;
      case "equipment":
        return d.equipment.length === 0;
      case "goals":
        return d.goals.length === 0;
      case "health-declaration":
        return !d.healthComplete || !d.healthConsentsComplete;
      default:
        return false;
    }
  }

  function stepBlockReason(stepId: StepId): string | null {
    const d = deps();
    switch (stepId) {
      case "name":
        return d.nameComplete ? null : t.onboarding.name.emptyWarning();
      case "equipment":
        return d.equipment.length > 0 ? null : t.onboarding.equipment.emptyWarning();
      case "goals":
        return d.goals.length > 0 ? null : t.onboarding.goals.emptyWarning();
      case "health-declaration":
        if (!d.healthComplete) return t.onboarding.healthDeclaration.incompleteError();
        if (!d.healthDeclarationAccepted) {
          return "יש לאשר את הצהרת נכונות המידע.";
        }
        if (!d.healthInfoConsent) {
          return "יש לאשר את הסכמת שמירת המידע הבריאותי.";
        }
        return null;
      default:
        return null;
    }
  }

  return { stepIsIncomplete, stepBlockReason };
}
