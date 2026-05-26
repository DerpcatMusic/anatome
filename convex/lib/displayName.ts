import { RULES } from "./constants";

export function buildDisplayName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

export function normalizeNamePart(value: string, fieldLabel: string): string {
  const cleaned = value.trim().replace(/\s+/g, " ");
  if (cleaned.length < 1) {
    throw new Error(`${fieldLabel} is required.`);
  }
  if (cleaned.length > RULES.MAX_NAME_PART_LENGTH) {
    throw new Error(`${fieldLabel} is too long.`);
  }
  return cleaned;
}
