/**
 * Canonical equipment IDs — single source of truth for Convex validators and the app UI.
 * Legacy `barrel` is accepted on read/write and normalized to `spine_corrector`.
 */

export const CANONICAL_EQUIPMENT_IDS = [
  "mat",
  "reformer",
  "cadillac",
  "chair",
  "spine_corrector",
  "small_ball",
  "resistance_band",
  "roller",
  "light_weights",
  "magic_circle",
  "spiky_balls",
] as const;

export type CanonicalEquipmentId = (typeof CANONICAL_EQUIPMENT_IDS)[number];

/** Stored in legacy memberProfiles / classes; normalized away on write. */
export const LEGACY_EQUIPMENT_STORAGE_IDS = ["barrel"] as const;

export type LegacyEquipmentStorageId = (typeof LEGACY_EQUIPMENT_STORAGE_IDS)[number];

export type EquipmentStorageId = CanonicalEquipmentId | LegacyEquipmentStorageId;

export const EQUIPMENT_STORAGE_IDS: readonly EquipmentStorageId[] = [
  ...CANONICAL_EQUIPMENT_IDS,
  ...LEGACY_EQUIPMENT_STORAGE_IDS,
];

const LEGACY_ALIASES: Record<string, CanonicalEquipmentId> = {
  barrel: "spine_corrector",
};

const canonicalSet = new Set<string>(CANONICAL_EQUIPMENT_IDS);

/** English labels used in equipment pickers (Hebrew product copy lives in i18n where needed). */
export const equipmentDisplayLabels: Record<CanonicalEquipmentId, string> = {
  mat: "Mat",
  reformer: "Reformer",
  cadillac: "Cadillac",
  chair: "Chair",
  spine_corrector: "Spine Corrector",
  small_ball: "Small Ball",
  resistance_band: "Resistance Band",
  roller: "Roller",
  light_weights: "Weights",
  magic_circle: "Magic Circle",
  spiky_balls: "Spiky Balls",
};

export function isCanonicalEquipmentId(id: string): id is CanonicalEquipmentId {
  return canonicalSet.has(id);
}

export function isEquipmentStorageId(id: string): id is EquipmentStorageId {
  return (
    isCanonicalEquipmentId(id) ||
    (LEGACY_EQUIPMENT_STORAGE_IDS as readonly string[]).includes(id)
  );
}

/** Map any known equipment id to the canonical id used in UI and new writes. */
export function normalizeEquipmentId(id: string): CanonicalEquipmentId | null {
  const aliased = LEGACY_ALIASES[id] ?? id;
  return isCanonicalEquipmentId(aliased) ? aliased : null;
}

/** Deduplicated canonical list for persisting member profiles and class requirements. */
export function normalizeEquipmentList(ids: readonly string[]): CanonicalEquipmentId[] {
  const result: CanonicalEquipmentId[] = [];
  for (const id of ids) {
    const normalized = normalizeEquipmentId(id);
    if (normalized !== null && !result.includes(normalized)) {
      result.push(normalized);
    }
  }
  return result;
}

export function equipmentDisplayLabel(id: string): string {
  const normalized = normalizeEquipmentId(id);
  if (normalized !== null) return equipmentDisplayLabels[normalized];
  return id;
}
