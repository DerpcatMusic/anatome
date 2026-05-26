/** Equipment required by a class that the member profile does not include. */
export function missingRequiredEquipment(
  memberEquipment: string[],
  requiredEquipment: string[],
) {
  return requiredEquipment.filter((item) => !memberEquipment.includes(item));
}

/** Whether the viewer's profile equipment satisfies class requirements. */
export function viewerCanAccessLiveClass(
  memberEquipment: string[],
  requiredEquipment: string[],
): boolean {
  return missingRequiredEquipment(memberEquipment, requiredEquipment).length === 0;
}
