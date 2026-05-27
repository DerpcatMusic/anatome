// ─── Shared label dictionaries ───
// Equipment, pathology, goal, and experience IDs/labels are sourced from Convex catalogs.

import {
  CANONICAL_EQUIPMENT_IDS,
  equipmentDisplayLabels,
  normalizeEquipmentId as normalizeEquipmentIdFromCatalog,
  type CanonicalEquipmentId,
} from "$convex/lib/equipmentCatalog";
import {
  EXPERIENCE_IDS,
  experienceDisplayLabels,
  isExperienceId,
} from "$convex/lib/experienceCatalog";
import {
  CANONICAL_GOAL_IDS,
  canonicalGoalDisplayLabels,
  goalDisplayLabel,
  isCanonicalGoalId,
  isGoalId,
  type CanonicalGoalId,
} from "$convex/lib/goalCatalog";
import {
  PATHOLOGY_IDS,
  pathologyDisplayLabels,
  isPathologyId,
  type PathologyId,
} from "$convex/lib/pathologyCatalog";

export const experienceOptions = EXPERIENCE_IDS.map(
  (id) => [id, experienceDisplayLabels[id]] as const,
);

export type Experience = (typeof experienceOptions)[number][0];

export const equipmentOptions = CANONICAL_EQUIPMENT_IDS.map(
  (id) => [id, equipmentDisplayLabels[id]] as const,
);

export type Equipment = CanonicalEquipmentId;

export const goalOptions = CANONICAL_GOAL_IDS.map(
  (id) => [id, canonicalGoalDisplayLabels[id]] as const,
);

export type Goal = CanonicalGoalId;

export const pathologyOptions = PATHOLOGY_IDS.map(
  (id) => [id, pathologyDisplayLabels[id]] as const,
);

export type Pathology = PathologyId;

export const experienceLabelMap: Record<string, string> = Object.fromEntries(experienceOptions);
export const equipmentLabelMap: Record<string, string> = Object.fromEntries(equipmentOptions);
export const goalLabelMap: Record<string, string> = Object.fromEntries(goalOptions);
export const pathologyLabelMap: Record<string, string> = Object.fromEntries(pathologyOptions);

export function equipmentLabel(id: string): string {
  const normalized = normalizeEquipmentIdFromCatalog(id);
  if (normalized !== null) return equipmentDisplayLabels[normalized];
  return id;
}

export function normalizeEquipmentId(id: string): Equipment | null {
  return normalizeEquipmentIdFromCatalog(id);
}

export function experienceLabel(id: string): string {
  if (isExperienceId(id)) return experienceDisplayLabels[id];
  return id;
}

export function goalLabel(id: string): string {
  return goalDisplayLabel(id);
}

export function pathologyLabel(id: string): string {
  return isPathologyId(id) ? pathologyDisplayLabels[id] : id;
}

export { isCanonicalGoalId, isGoalId };

export function fmtList(arr: string[], labels: Record<string, string>): string {
  return arr.map((v) => labels[v] ?? v).filter(Boolean).join(", ") || "—";
}

/** Equipment labels with legacy id normalization (e.g. barrel → spine corrector). */
export function fmtEquipmentList(arr: string[]): string {
  return arr.map(equipmentLabel).filter(Boolean).join(", ") || "—";
}

export function classTypeLabel(type: "group_live" | "one_on_one"): string {
  return type === "one_on_one" ? "1:1 אישי" : "לייב קבוצתי";
}

export function creditLabel(kind: "live" | "oneOnOne"): string {
  return kind === "oneOnOne" ? "קרדיט 1:1 אחד" : "קרדיט לייב אחד";
}

export function durationLabel(seconds: number | undefined | null): string {
  if (seconds === undefined || seconds === null || seconds <= 0) return "—";
  return `${Math.round(seconds / 60)} דקות`;
}

/** Instructor-facing labels for video access models (not internal Macroflow/Microflow jargon). */
export const videoAccessLabels = {
  macroflow: "רכישה חד-פעמית",
  microflow: "מנוי בלבד",
} as const;

export type VideoAccessKind = keyof typeof videoAccessLabels;

export function videoAccessLabel(kind: VideoAccessKind): string {
  return videoAccessLabels[kind];
}
