/** Split stored display name into first / family name (Hebrew-friendly: first token + rest). */
export function splitDisplayName(displayName: string): {
  firstName: string;
  lastName: string;
} {
  const trimmed = displayName.trim();
  if (trimmed === "") return { firstName: "", lastName: "" };
  const parts = trimmed.split(/\s+/);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

export function buildDisplayName(firstName: string, lastName: string): string {
  return `${firstName.trim()} ${lastName.trim()}`.trim();
}

/** OAuth / default profile often seeds displayName with the email address. */
export function isLikelyEmailPlaceholder(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export function displayNameForOnboardingPrefill(displayName: string | undefined | null): {
  firstName: string;
  lastName: string;
} {
  const raw = displayName?.trim() ?? "";
  if (raw === "" || isLikelyEmailPlaceholder(raw)) {
    return { firstName: "", lastName: "" };
  }
  return splitDisplayName(raw);
}
