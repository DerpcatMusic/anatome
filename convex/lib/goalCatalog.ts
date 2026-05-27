/**
 * Canonical and legacy goal IDs — single source of truth for validators and UI.
 * Legacy goals remain valid in stored memberProfiles; pickers use canonical IDs only.
 */

export const CANONICAL_GOAL_IDS = [
  "pelvic_floor_rehab",
  "stress_breathing",
  "functional_daily",
  "back_pathology",
] as const;

export type CanonicalGoalId = (typeof CANONICAL_GOAL_IDS)[number];

/** Legacy goals — kept for existing memberProfiles; not offered in new pickers. */
export const LEGACY_GOAL_IDS = [
  "strength",
  "mobility",
  "posture",
  "back_care",
  "return_to_movement",
] as const;

export type LegacyGoalId = (typeof LEGACY_GOAL_IDS)[number];

export type GoalId = CanonicalGoalId | LegacyGoalId;

export const GOAL_IDS: readonly GoalId[] = [...CANONICAL_GOAL_IDS, ...LEGACY_GOAL_IDS];

const goalSet = new Set<string>(GOAL_IDS);

/** Hebrew labels for canonical goals (onboarding picker). */
export const canonicalGoalDisplayLabels: Record<CanonicalGoalId, string> = {
  pelvic_floor_rehab: "שיקום רצפת אגן",
  stress_breathing: "הפחתת סטרס ונשימה",
  functional_daily: "חיזוק פונקציונלי יום יומי",
  back_pathology: "טיפול בפתולוגיות גב",
};

/** Hebrew labels for legacy stored goals (profile/dashboard read paths). */
export const legacyGoalDisplayLabels: Record<LegacyGoalId, string> = {
  strength: "כוח",
  mobility: "תנועה",
  posture: "יציבה",
  back_care: "גב",
  return_to_movement: "חזרה לתנועה",
};

export function isGoalId(id: string): id is GoalId {
  return goalSet.has(id);
}

export function isCanonicalGoalId(id: string): id is CanonicalGoalId {
  return (CANONICAL_GOAL_IDS as readonly string[]).includes(id);
}

export function goalDisplayLabel(id: string): string {
  if (isCanonicalGoalId(id)) return canonicalGoalDisplayLabels[id];
  if ((LEGACY_GOAL_IDS as readonly string[]).includes(id)) {
    return legacyGoalDisplayLabels[id as LegacyGoalId];
  }
  return id;
}

/** Deduplicated valid goal list for persisting member profiles. */
export function normalizeGoalList(ids: readonly string[]): GoalId[] {
  const result: GoalId[] = [];
  for (const id of ids) {
    if (isGoalId(id) && !result.includes(id)) {
      result.push(id);
    }
  }
  return result;
}
