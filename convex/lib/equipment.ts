import { normalizeEquipmentId } from "./equipmentCatalog";

function memberEquipmentSet(memberEquipment: readonly string[]): Set<string> {
  const set = new Set<string>();
  for (const id of memberEquipment) {
    const normalized = normalizeEquipmentId(id);
    if (normalized !== null) set.add(normalized);
  }
  return set;
}

/** Equipment required by a class that the member profile does not include. */
export function missingRequiredEquipment(
  memberEquipment: readonly string[],
  requiredEquipment: readonly string[],
) {
  const owned = memberEquipmentSet(memberEquipment);
  return requiredEquipment.filter((item) => {
    const required = normalizeEquipmentId(item) ?? item;
    return !owned.has(required);
  });
}

/** Whether the viewer's profile equipment satisfies class requirements. */
export function viewerCanAccessLiveClass(
  memberEquipment: readonly string[],
  requiredEquipment: readonly string[],
): boolean {
  return missingRequiredEquipment(memberEquipment, requiredEquipment).length === 0;
}
