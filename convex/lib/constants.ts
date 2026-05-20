// ═══════════════════════════════════════════════════════════
// Time constants (milliseconds)
// ═══════════════════════════════════════════════════════════
export const MS = {
  SECOND: 1_000,
  MINUTE: 60_000,
  FIVE_MINUTES: 300_000,
  THIRTY_MINUTES: 1_800_000,
  HOUR: 3_600_000,
  TWO_HOURS: 7_200_000,
  DAY: 86_400_000,
} as const;

// ═══════════════════════════════════════════════════════════
// Business rule constants
// ═══════════════════════════════════════════════════════════
export const RULES = {
  /** Min class duration in minutes */
  MIN_CLASS_DURATION_MINUTES: 15,
  /** Max class duration in minutes */
  MAX_CLASS_DURATION_MINUTES: 180,
  /** Max group live class capacity */
  MAX_GROUP_CAPACITY: 12,
  /** Default credit cost for a class/video */
  DEFAULT_CREDIT_COST: 1,
  /** Video completion threshold percent */
  VIDEO_COMPLETION_PERCENT: 90,
  /** Max note length characters */
  MAX_NOTE_LENGTH: 500,
  /** Max onboarding notes length */
  MAX_ONBOARDING_NOTES_LENGTH: 600,
} as const;

// ═══════════════════════════════════════════════════════════
// Token / TTL constants
// ═══════════════════════════════════════════════════════════
export const TTL = {
  /** LiveKit join token TTL string */
  JOIN_TOKEN: "10m" as const,
  /** Mux playback token TTL string */
  PLAYBACK_TOKEN: "1h" as const,
  /** LiveKit empty room timeout buffer (seconds) */
  EMPTY_ROOM_BUFFER_SECONDS: 600,
  /** LiveKit minimum empty room timeout (seconds) */
  MIN_EMPTY_TIMEOUT_SECONDS: 3600,
  /** LiveKit participant departure timeout (seconds) */
  DEPARTURE_TIMEOUT_SECONDS: 20,
} as const;

// ═══════════════════════════════════════════════════════════
// Query limits
// ═══════════════════════════════════════════════════════════
export const LIMITS = {
  /** Max instructors fetched for 1:1 */
  MAX_INSTRUCTORS: 25,
  /** Max admins fetched for guard checks */
  MAX_ADMINS_CHECK: 10,
  /** Max 1:1 slots returned */
  MAX_SLOTS: 80,
  /** Default pagination page size */
  PAGE_SIZE: 50,
  /** Large page size for catalog */
  CATALOG_PAGE_SIZE: 200,
} as const;
