import { RULES } from "./constants";
import { normalizeEquipmentList } from "./equipmentCatalog";
import { normalizePathologyList } from "./pathologyCatalog";
export type HealthDeclarationAnswers = {
  heartCondition: "yes" | "no";
  chestPain: "yes" | "no";
  dizziness: "yes" | "no";
  boneJointIssue: "yes" | "no";
  highBloodPressure: "yes" | "no";
  pregnancy: "yes" | "no";
  recentBirth: "yes" | "no";
  recentSurgery: "yes" | "no";
};

export type OnboardingCompleteInput = {
  firstName: string;
  lastName: string;
  equipment: string[];
  experience: "new" | "some" | "steady";
  goals: OnboardingGoal[];
  pathologies: string[];
  notes: string;
  healthDeclarationAnswers: HealthDeclarationAnswers;
  healthInfoConsent: boolean;
  healthDeclarationAccepted: boolean;
};

export type OnboardingGoal =
  | "pelvic_floor_rehab"
  | "stress_breathing"
  | "functional_daily"
  | "back_pathology"
  | "strength"
  | "mobility"
  | "posture"
  | "back_care"
  | "return_to_movement";

export type PreparedOnboardingProfile = {
  firstName: string;
  lastName: string;
  displayName: string;
  equipment: ReturnType<typeof normalizeEquipmentList>;
  experience: "new" | "some" | "steady";
  goals: OnboardingGoal[];
  pathologies: ReturnType<typeof normalizePathologyList>;
  notes: string;
  healthDeclarationAnswers: HealthDeclarationAnswers;
};

export function hasSensitiveHealthData(args: {
  pathologies: readonly string[];
  notes: string;
  healthDeclarationAnswers: HealthDeclarationAnswers;
}): boolean {
  if (args.pathologies.length > 0) return true;
  if (args.notes.trim().length > 0) return true;
  return Object.values(args.healthDeclarationAnswers).some((answer) => answer === "yes");
}

function normalizeNamePartHebrew(value: string, fieldLabel: string): string {
  const cleaned = value.trim().replace(/\s+/g, " ");
  if (cleaned.length < 1) {
    throw new Error(`${fieldLabel} הוא שדה חובה.`);
  }
  if (cleaned.length > RULES.MAX_NAME_PART_LENGTH) {
    throw new Error(`${fieldLabel} ארוך מדי.`);
  }
  return cleaned;
}

export function prepareOnboardingProfile(
  args: OnboardingCompleteInput,
): PreparedOnboardingProfile {
  const firstName = normalizeNamePartHebrew(args.firstName, "שם פרטי");
  const lastName = normalizeNamePartHebrew(args.lastName, "שם משפחה");
  const displayName = `${firstName} ${lastName}`.trim();

  const equipment = normalizeEquipmentList(args.equipment);
  if (equipment.length === 0) {
    throw new Error("נדרש לבחור לפחות פריט ציוד אחד.");
  }

  if (args.goals.length === 0) {
    throw new Error("נדרש לבחור לפחות מטרה אחת.");
  }

  const pathologies = normalizePathologyList(args.pathologies);
  const notes = args.notes.trim().slice(0, RULES.MAX_ONBOARDING_NOTES_LENGTH);

  if (!args.healthDeclarationAccepted) {
    throw new Error("יש לאשר את הצהרת הבריאות לפני שמירת הפרופיל.");
  }

  const sensitive = hasSensitiveHealthData({
    pathologies,
    notes,
    healthDeclarationAnswers: args.healthDeclarationAnswers,
  });

  if (!args.healthInfoConsent) {
    throw new Error(
      sensitive
        ? "נדרשת הסכמה לשמירת מידע בריאותי כשמציינים פתולוגיות, הערות או תשובות «כן» בהצהרה."
        : "נדרשת הסכמה לשמירת מידע בריאותי לפני שמירת הנתונים.",
    );
  }

  return {
    firstName,
    lastName,
    displayName,
    equipment,
    experience: args.experience,
    goals: args.goals,
    pathologies,
    notes,
    healthDeclarationAnswers: args.healthDeclarationAnswers,
  };
}
