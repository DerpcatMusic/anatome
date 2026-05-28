import { LANDING_COPY_FORMAT } from "./landing-copy-manifest";

const STORAGE_KEY = "homebody-landing-copy-draft";

export type LandingCopyDraft = {
  format: typeof LANDING_COPY_FORMAT;
  savedAt: string;
  values: Record<string, string>;
};

export function loadLandingCopyDraft(): LandingCopyDraft | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LandingCopyDraft;
    if (parsed?.format !== LANDING_COPY_FORMAT || typeof parsed.values !== "object") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveLandingCopyDraft(values: Record<string, string>): void {
  if (typeof localStorage === "undefined") return;
  const draft: LandingCopyDraft = {
    format: LANDING_COPY_FORMAT,
    savedAt: new Date().toISOString(),
    values,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

export function clearLandingCopyDraft(): void {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
