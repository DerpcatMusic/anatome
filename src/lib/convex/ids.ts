import type { Id } from "$convex/_generated/dataModel";

/** Convex document ids are lowercase alphanumeric (opaque on the client). */
const CONVEX_DOCUMENT_ID = /^[a-z0-9]+$/;

const MIN_ID_LENGTH = 10;
const MAX_ID_LENGTH = 64;

/**
 * Parse a `classId` query param before hitting Convex.
 * Returns null when absent/blank or syntactically invalid.
 */
export function parseLiveClassId(raw: string | null | undefined): Id<"liveClasses"> | null {
  if (raw === null || raw === undefined) return null;
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  if (
    trimmed.length < MIN_ID_LENGTH ||
    trimmed.length > MAX_ID_LENGTH ||
    !CONVEX_DOCUMENT_ID.test(trimmed)
  ) {
    return null;
  }
  return trimmed as Id<"liveClasses">;
}

export function hasLiveClassIdParam(raw: string | null | undefined): boolean {
  if (raw === null || raw === undefined) return false;
  return raw.trim() !== "";
}

export function isInvalidLiveClassIdParam(raw: string | null | undefined): boolean {
  return hasLiveClassIdParam(raw) && parseLiveClassId(raw) === null;
}
