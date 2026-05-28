import {
  emptyHealthDeclarationAnswers,
  healthDeclarationQuestionIds,
  type HealthDeclarationAnswers,
} from "./health-declaration";

const DRAFT_KEY = "homebody:onboarding-draft";
const DRAFT_VERSION = 1;

export type OnboardingDraft = {
  version: number;
  stepIndex: number;
  firstName: string;
  lastName: string;
  equipment: string[];
  goals: string[];
  experience: "new" | "some" | "steady";
  pathologies: string[];
  notes: string;
  healthDeclarationAnswers: HealthDeclarationAnswers;
  healthInfoConsent: boolean;
  healthDeclarationAccepted: boolean;
  savedAt: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseHealthAnswers(raw: unknown): HealthDeclarationAnswers {
  const base = emptyHealthDeclarationAnswers();
  if (!isRecord(raw)) return base;
  for (const id of healthDeclarationQuestionIds) {
    const answer = raw[id];
    if (answer === "yes" || answer === "no") {
      base[id] = answer;
    }
  }
  return base;
}

export function loadOnboardingDraft(): OnboardingDraft | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed.version !== DRAFT_VERSION) return null;

    const experience = parsed.experience;
    if (experience !== "new" && experience !== "some" && experience !== "steady") {
      return null;
    }

    const stepIndex = typeof parsed.stepIndex === "number" ? parsed.stepIndex : 0;

    return {
      version: DRAFT_VERSION,
      stepIndex: Math.max(0, Math.min(6, Math.floor(stepIndex))),
      firstName: typeof parsed.firstName === "string" ? parsed.firstName : "",
      lastName: typeof parsed.lastName === "string" ? parsed.lastName : "",
      equipment: Array.isArray(parsed.equipment)
        ? parsed.equipment.filter((item): item is string => typeof item === "string")
        : [],
      goals: Array.isArray(parsed.goals)
        ? parsed.goals.filter((item): item is string => typeof item === "string")
        : [],
      experience,
      pathologies: Array.isArray(parsed.pathologies)
        ? parsed.pathologies.filter((item): item is string => typeof item === "string")
        : [],
      notes: typeof parsed.notes === "string" ? parsed.notes : "",
      healthDeclarationAnswers: parseHealthAnswers(parsed.healthDeclarationAnswers),
      healthInfoConsent: parsed.healthInfoConsent === true,
      healthDeclarationAccepted: parsed.healthDeclarationAccepted === true,
      savedAt: typeof parsed.savedAt === "number" ? parsed.savedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

export function saveOnboardingDraft(draft: Omit<OnboardingDraft, "version" | "savedAt">) {
  if (typeof localStorage === "undefined") return;
  try {
    const payload: OnboardingDraft = {
      ...draft,
      version: DRAFT_VERSION,
      savedAt: Date.now(),
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
  } catch {
    /* quota / private mode */
  }
}

export function clearOnboardingDraft() {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}
