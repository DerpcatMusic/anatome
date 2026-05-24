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
  /** Max simultaneous pending 1:1 requests per customer (abuse guard) */
  MAX_PENDING_ONE_ON_ONE_REQUESTS: 5,
  /** Max onboarding notes length */
  MAX_ONBOARDING_NOTES_LENGTH: 600,
  /** Fixed duration for private 1:1 lessons (minutes) */
  ONE_ON_ONE_DURATION_MINUTES: 45,
  /** Gap between bookable 1:1 slots generated from availability rules (minutes) */
  ONE_ON_ONE_BUFFER_MINUTES: 15,
  /** Minutes before startsAt when live room join opens (customers + instructors) */
  LIVE_JOIN_OPENS_MINUTES_BEFORE: 15,
  /** Max configurable join-opens offset when scheduling a class */
  LIVE_JOIN_OPENS_MINUTES_MAX: 60,
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
  /** Large page size for catalog / video grids */
  CATALOG_PAGE_SIZE: 200,
  /** Admin video list per status */
  ADMIN_VIDEO_PAGE: 100,
  /** Category list page */
  CATEGORY_PAGE: 100,
  /** Videos per category group in catalog */
  CATEGORY_GROUP_SIZE: 50,
  /** Dashboard reservation preview */
  DASHBOARD_RESERVATIONS: 20,
  /** Dashboard live class lookup */
  DASHBOARD_LIVE_CLASSES: 50,
  /** Calendar upcoming classes */
  CALENDAR_UPCOMING: 50,
  /** Calendar range class lookup */
  CALENDAR_RANGE_CLASSES: 100,
  /** Calendar viewer reservations lookup */
  CALENDAR_RESERVATIONS: 200,
  /** Customer 1:1 request history */
  CUSTOMER_REQUESTS: 25,
  /** Instructor pending requests */
  INSTRUCTOR_REQUESTS: 50,
  /** Instructor class list */
  INSTRUCTOR_CLASSES: 50,
  /** Live class participant list */
  LIVE_PARTICIPANTS: 50,
  /** Playback token batch */
  PLAYBACK_BATCH: 50,
  /** Reminder processing batch */
  REMINDER_BATCH: 50,
  /** Cron job batch sizes */
  CRON_CLASSES: 50,
  CRON_SETTLE: 100,
  CRON_ONE_ON_ONE: 100,
  SUBSCRIPTION_RENEWALS: 100,
} as const;
