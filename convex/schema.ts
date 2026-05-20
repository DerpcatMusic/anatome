import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { equipmentListValidator, experienceValidator, goalsValidator } from "./lib/validators";

export default defineSchema({
  ...authTables,

  plans: defineTable({
    slug: v.string(),
    nameHe: v.string(),
    monthlyPriceIls: v.number(),
    vodCreditsPerMonth: v.number(),
    liveCreditsPerMonth: v.number(),
    oneOnOneCreditsPerMonth: v.number(),
    isActive: v.boolean(),
  }).index("by_slug", ["slug"]),

  creditBuckets: defineTable({
    userId: v.id("users"),
    periodStart: v.number(),
    periodEnd: v.number(),
    vodGranted: v.number(),
    vodUsed: v.number(),
    liveGranted: v.number(),
    liveReserved: v.optional(v.number()),
    liveUsed: v.number(),
    oneOnOneGranted: v.number(),
    oneOnOneReserved: v.optional(v.number()),
    oneOnOneUsed: v.number(),
  }).index("by_user_period", ["userId", "periodStart"]),

  appProfiles: defineTable({
    userId: v.id("users"),
    email: v.string(),
    displayName: v.string(),
    role: v.union(v.literal("customer"), v.literal("instructor"), v.literal("admin")),
    instructorEnabledAt: v.optional(v.number()),
    instructorDisabledAt: v.optional(v.number()),
    credentials: v.optional(v.string()),
    certificateDocument: v.optional(v.string()),
    insuranceDocument: v.optional(v.string()),
    updatedAt: v.number(),
  })
    // NOTE: Convex does not yet support unique non-ID indexes.
    // Application code must guard against duplicate userId inserts.
    .index("by_userId", ["userId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  adminAuditEvents: defineTable({
    actorUserId: v.id("users"),
    targetUserId: v.optional(v.id("users")),
    action: v.string(),
    metadata: v.string(),
    createdAt: v.number(),
  })
    .index("by_actorUserId_and_createdAt", ["actorUserId", "createdAt"])
    .index("by_targetUserId_and_createdAt", ["targetUserId", "createdAt"])
    .index("by_action_and_createdAt", ["action", "createdAt"]),

  liveClasses: defineTable({
    title: v.string(),
    description: v.string(),
    type: v.union(v.literal("group_live"), v.literal("one_on_one")),
    instructorUserId: v.id("users"),
    startsAt: v.number(),
    endsAt: v.number(),
    joinOpensAt: v.number(),
    joinClosesAt: v.number(),
    capacity: v.number(),
    requiredEquipment: equipmentListValidator,
    creditKind: v.union(v.literal("live"), v.literal("oneOnOne")),
    creditCost: v.number(),
    status: v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("live"),
      v.literal("ended"),
      v.literal("cancelled"),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
    seatsTaken: v.optional(v.number()),
  })
    .index("by_startsAt", ["startsAt"])
    .index("by_status_and_startsAt", ["status", "startsAt"])
    .index("by_status_and_joinClosesAt", ["status", "joinClosesAt"])
    .index("by_instructorUserId_and_startsAt", ["instructorUserId", "startsAt"])
    .index("by_type_and_startsAt", ["type", "startsAt"]),

  liveRooms: defineTable({
    liveClassId: v.id("liveClasses"),
    provider: v.literal("livekit"),
    roomName: v.string(),
    status: v.union(v.literal("pending"), v.literal("active"), v.literal("ended")),
    startedAt: v.optional(v.number()),
    endedAt: v.optional(v.number()),
    startedByUserId: v.optional(v.id("users")),
    updatedAt: v.number(),
  })
    .index("by_liveClassId", ["liveClassId"])
    .index("by_roomName", ["roomName"])
    .index("by_status", ["status"]),

  liveReservations: defineTable({
    liveClassId: v.id("liveClasses"),
    userId: v.id("users"),
    creditBucketId: v.id("creditBuckets"),
    status: v.union(
      v.literal("reserved"),
      v.literal("joined"),
      v.literal("cancelled"),
      v.literal("refunded"),
      v.literal("no_show"),
    ),
    creditKind: v.union(v.literal("live"), v.literal("oneOnOne")),
    creditsReserved: v.number(),
    reservedAt: v.number(),
    joinedAt: v.optional(v.number()),
    cancelledAt: v.optional(v.number()),
  })
    .index("by_liveClassId_and_userId", ["liveClassId", "userId"])
    .index("by_liveClassId_and_status", ["liveClassId", "status"])
    .index("by_userId_and_status", ["userId", "status"])
    .index("by_userId_and_reservedAt", ["userId", "reservedAt"])
    .index("by_creditBucketId", ["creditBucketId"]),

  liveJoinEvents: defineTable({
    liveClassId: v.id("liveClasses"),
    userId: v.id("users"),
    role: v.union(v.literal("customer"), v.literal("instructor"), v.literal("admin")),
    result: v.union(v.literal("allowed"), v.literal("denied")),
    reason: v.string(),
    createdAt: v.number(),
  })
    .index("by_liveClassId_and_createdAt", ["liveClassId", "createdAt"])
    .index("by_userId_and_createdAt", ["userId", "createdAt"]),

  liveAttendance: defineTable({
    liveClassId: v.id("liveClasses"),
    userId: v.id("users"),
    identity: v.string(),
    joinedAt: v.number(),
    leftAt: v.optional(v.number()),
  })
    .index("by_liveClassId_and_identity", ["liveClassId", "identity"])
    .index("by_liveClassId_and_userId", ["liveClassId", "userId"]),

  liveReminderEvents: defineTable({
    liveClassId: v.id("liveClasses"),
    reservationId: v.id("liveReservations"),
    userId: v.id("users"),
    kind: v.union(v.literal("day_before"), v.literal("thirty_minutes")),
    sendAt: v.number(),
    status: v.union(v.literal("pending"), v.literal("sent"), v.literal("cancelled"), v.literal("skipped")),
    createdAt: v.number(),
    processedAt: v.optional(v.number()),
  })
    .index("by_status_and_sendAt", ["status", "sendAt"])
    .index("by_reservationId", ["reservationId"])
    .index("by_liveClassId", ["liveClassId"]),

  oneOnOneAvailabilityRules: defineTable({
    instructorUserId: v.id("users"),
    weekday: v.number(),
    startMinute: v.number(),
    endMinute: v.number(),
    slotMinutes: v.number(),
    bufferMinutes: v.number(),
    timezone: v.string(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_instructorUserId_and_weekday", ["instructorUserId", "weekday"])
    .index("by_isActive_and_weekday", ["isActive", "weekday"]),

  oneOnOneAvailabilityExceptions: defineTable({
    instructorUserId: v.id("users"),
    startsAt: v.number(),
    endsAt: v.number(),
    kind: v.union(v.literal("blocked"), v.literal("extra_open")),
    note: v.string(),
    createdAt: v.number(),
  })
    .index("by_instructorUserId_and_startsAt", ["instructorUserId", "startsAt"])
    .index("by_startsAt", ["startsAt"]),

  oneOnOneRequests: defineTable({
    customerUserId: v.id("users"),
    instructorUserId: v.id("users"),
    requestedStartsAt: v.number(),
    requestedEndsAt: v.number(),
    note: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("cancelled"),
      v.literal("expired"),
    ),
    creditBucketId: v.id("creditBuckets"),
    liveClassId: v.optional(v.id("liveClasses")),
    createdAt: v.number(),
    updatedAt: v.number(),
    decidedAt: v.optional(v.number()),
  })
    .index("by_customerUserId_and_createdAt", ["customerUserId", "createdAt"])
    .index("by_customerUserId_and_status", ["customerUserId", "status"])
    .index("by_instructorUserId_and_status_and_requestedStartsAt", ["instructorUserId", "status", "requestedStartsAt"])
    .index("by_status_and_requestedStartsAt", ["status", "requestedStartsAt"])
    .index("by_instructorUserId_and_requestedStartsAt", ["instructorUserId", "requestedStartsAt"]),

  videos: defineTable({
    title: v.string(),
    description: v.string(),
    provider: v.union(v.literal("cloudflare_stream"), v.literal("bunny_stream"), v.literal("mux")),
    providerVideoId: v.string(),
    playbackId: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    durationSeconds: v.number(),
    requiredEquipment: equipmentListValidator,
    accessKind: v.union(v.literal("macroflow"), v.literal("microflow")),
    muxVideoQuality: v.union(v.literal("basic"), v.literal("plus"), v.literal("premium")),
    muxMaxResolutionTier: v.union(v.literal("1080p"), v.literal("1440p"), v.literal("2160p")),
    staticRendition: v.optional(v.union(v.literal("none"), v.literal("audio-only"), v.literal("720p"), v.literal("1080p"))),
    status: v.union(v.literal("draft"), v.literal("published"), v.literal("archived")),
    createdAt: v.number(),
    updatedAt: v.number(),
    instructorUserId: v.optional(v.id("users")),
  })
    .index("by_status", ["status"])
    .index("by_status_and_createdAt", ["status", "createdAt"])
    .index("by_instructorUserId_and_createdAt", ["instructorUserId", "createdAt"]),

  videoUploads: defineTable({
    videoId: v.id("videos"),
    instructorUserId: v.id("users"),
    muxUploadId: v.string(),
    muxAssetId: v.optional(v.string()),
    muxVideoQuality: v.union(v.literal("basic"), v.literal("plus"), v.literal("premium")),
    muxMaxResolutionTier: v.union(v.literal("1080p"), v.literal("1440p"), v.literal("2160p")),
    staticRendition: v.union(v.literal("none"), v.literal("audio-only"), v.literal("720p"), v.literal("1080p")),
    status: v.union(v.literal("waiting"), v.literal("asset_created"), v.literal("ready"), v.literal("errored")),
    errorMessage: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_videoId", ["videoId"])
    .index("by_muxUploadId", ["muxUploadId"])
    .index("by_instructorUserId", ["instructorUserId"])
    .index("by_status", ["status"]),

  videoEntitlements: defineTable({
    videoId: v.id("videos"),
    userId: v.id("users"),
    kind: v.literal("macroflow"),
    source: v.literal("purchase"),
    creditBucketId: v.optional(v.id("creditBuckets")),
    purchasedAt: v.number(),
  })
    .index("by_userId_and_videoId", ["userId", "videoId"])
    .index("by_userId_and_kind", ["userId", "kind"])
    .index("by_creditBucketId", ["creditBucketId"]),

  videoCategories: defineTable({
    slug: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    sortOrder: v.number(),
    isActive: v.boolean(),
    createdByUserId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_sortOrder", ["sortOrder"])
    .index("by_slug", ["slug"])
    .index("by_isActive_and_sortOrder", ["isActive", "sortOrder"]),

  videoCategoryVideos: defineTable({
    categoryId: v.id("videoCategories"),
    videoId: v.id("videos"),
    sortOrder: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_categoryId_and_sortOrder", ["categoryId", "sortOrder"])
    .index("by_categoryId_and_videoId", ["categoryId", "videoId"])
    .index("by_videoId", ["videoId"]),

  videoProgress: defineTable({
    videoId: v.id("videos"),
    userId: v.id("users"),
    currentTimeSeconds: v.number(),
    durationSeconds: v.number(),
    percentWatched: v.number(),
    completed: v.boolean(),
    updatedAt: v.number(),
  })
    .index("by_userId_and_videoId", ["userId", "videoId"])
    .index("by_userId_and_updatedAt", ["userId", "updatedAt"]),

  rateLimits: defineTable({
    userId: v.id("users"),
    action: v.string(),
    timestamp: v.number(),
  })
    .index("by_userId_and_action", ["userId", "action"])
    .index("by_timestamp", ["timestamp"]),

  memberProfiles: defineTable({
    userId: v.id("users"),
    equipment: equipmentListValidator,
    experience: experienceValidator,
    goals: goalsValidator,
    notes: v.string(),
    onboardingCompletedAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),
});
