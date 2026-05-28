import {
  normalizeEquipmentId,
  normalizeEquipmentList,
  type CanonicalEquipmentId,
} from "./equipmentCatalog";

function memberEquipmentSet(memberEquipment: readonly string[]): Set<CanonicalEquipmentId> {
  return new Set(normalizeEquipmentList(memberEquipment));
}

function classRequiredEquipment(requiredEquipment: readonly string[]): CanonicalEquipmentId[] {
  return normalizeEquipmentList(requiredEquipment);
}

/**
 * Class equipment gate (AND on required items):
 * - Class requires [mat] → member needs mat; mat+reformer is OK.
 * - Class requires [mat, reformer] → member needs both; mat-only is blocked.
 */
export function missingRequiredEquipment(
  memberEquipment: readonly string[],
  requiredEquipment: readonly string[],
): CanonicalEquipmentId[] {
  const owned = memberEquipmentSet(memberEquipment);
  return classRequiredEquipment(requiredEquipment).filter((required) => !owned.has(required));
}

/** Whether the member owns every item the class requires. */
export function viewerCanAccessLiveClass(
  memberEquipment: readonly string[],
  requiredEquipment: readonly string[],
): boolean {
  return missingRequiredEquipment(memberEquipment, requiredEquipment).length === 0;
}
