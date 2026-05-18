export function missingRequiredEquipment(userEquipment: string[], requiredEquipment: string[]) {
  return requiredEquipment.filter((item) => !userEquipment.includes(item));
}
