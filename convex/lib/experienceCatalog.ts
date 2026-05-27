/** Canonical experience levels — single source of truth for validators and UI. */

export const EXPERIENCE_IDS = ["new", "some", "steady"] as const;

export type ExperienceId = (typeof EXPERIENCE_IDS)[number];

const experienceSet = new Set<string>(EXPERIENCE_IDS);

/** Hebrew labels for onboarding, profile, and dashboard display. */
export const experienceDisplayLabels: Record<ExperienceId, string> = {
  new: "חדשה לגמרי",
  some: "חדשה לייט",
  steady: "מתרגלת קבועה",
};

export function isExperienceId(id: string): id is ExperienceId {
  return experienceSet.has(id);
}
