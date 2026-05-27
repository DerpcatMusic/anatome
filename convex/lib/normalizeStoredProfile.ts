import type { Doc } from "../_generated/dataModel";
import { RULES } from "./constants";
import { normalizeEquipmentList } from "./equipmentCatalog";
import { isExperienceId } from "./experienceCatalog";
import { normalizeGoalList } from "./goalCatalog";
import { normalizePathologyList } from "./pathologyCatalog";

export type MemberProfileDoc = Doc<"memberProfiles">;

export function normalizeDisplayName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function arraysEqual<T>(left: readonly T[], right: readonly T[]): boolean {
  return left.length === right.length && left.every((item, index) => item === right[index]);
}

export type NormalizedMemberProfilePatch = {
  equipment: ReturnType<typeof normalizeEquipmentList>;
  goals: ReturnType<typeof normalizeGoalList>;
  pathologies?: ReturnType<typeof normalizePathologyList>;
  notes: string;
  experience?: MemberProfileDoc["experience"];
};

/** Lenient catalog normalization for existing rows (no consent / min-equipment checks). */
export function normalizeStoredMemberProfile(
  profile: Pick<
    MemberProfileDoc,
    "equipment" | "goals" | "pathologies" | "notes" | "experience"
  >,
): NormalizedMemberProfilePatch {
  const equipment = normalizeEquipmentList(profile.equipment);
  const goals = normalizeGoalList(profile.goals);
  const pathologies =
    profile.pathologies !== undefined
      ? normalizePathologyList(profile.pathologies)
      : undefined;
  const notes = profile.notes.trim().slice(0, RULES.MAX_ONBOARDING_NOTES_LENGTH);
  const experience = isExperienceId(profile.experience) ? profile.experience : undefined;
  return { equipment, goals, pathologies, notes, experience };
}

export function memberProfileNeedsUpdate(
  profile: MemberProfileDoc,
  normalized: NormalizedMemberProfilePatch,
): boolean {
  if (!arraysEqual(profile.equipment, normalized.equipment)) return true;
  if (!arraysEqual(profile.goals, normalized.goals)) return true;
  if (profile.notes !== normalized.notes) return true;
  if (normalized.experience !== undefined && profile.experience !== normalized.experience) {
    return true;
  }
  if (profile.pathologies !== undefined && normalized.pathologies !== undefined) {
    if (!arraysEqual(profile.pathologies, normalized.pathologies)) return true;
  }
  return false;
}

export function buildMemberProfilePatch(
  profile: MemberProfileDoc,
  normalized: NormalizedMemberProfilePatch,
  now: number,
): Partial<MemberProfileDoc> {
  const patch: Partial<MemberProfileDoc> = {
    equipment: normalized.equipment,
    goals: normalized.goals,
    notes: normalized.notes,
    updatedAt: now,
  };
  if (normalized.pathologies !== undefined) {
    patch.pathologies = normalized.pathologies;
  }
  if (normalized.experience !== undefined && profile.experience !== normalized.experience) {
    patch.experience = normalized.experience;
  }
  return patch;
}
