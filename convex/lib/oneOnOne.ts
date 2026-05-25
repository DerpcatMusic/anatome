import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { LIMITS, MS, RULES } from "../lib/constants";
import { loadInstructorProfiles } from "../lib/instructorProfile";

export const oneOnOneTimezone = "Asia/Jerusalem";
export const dayMs = 24 * 60 * 60 * 1000;
export const minuteMs = 60 * 1000;

export type AvailableOneOnOneSlot = {
  instructorUserId: Id<"users">;
  instructorDisplayName: string;
  startsAt: number;
  endsAt: number;
  availableCredits: number;
};

/** Bookable 1:1 window for a single local day (continuous availability, not discrete slots). */
export type OneOnOneDayWindow = {
  dayStart: number;
  instructorUserId: Id<"users">;
  instructorDisplayName: string;
  instructorAvatarUrl: string | null;
  windowStartsAt: number;
  windowEndsAt: number;
  lessonDurationMs: number;
  earliestBookableAt: number;
  latestBookableStartAt: number;
  availableCredits: number;
};

export const oneOnOneLessonDurationMs = RULES.ONE_ON_ONE_DURATION_MINUTES * minuteMs;

export function startOfLocalDay(ts: number) {
  const date = new Date(ts);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function weekday(ts: number) {
  return new Date(ts).getDay();
}

export function oneOnOneAvailableCredits(wallet: Doc<"userWallets">) {
  return Math.max(0, wallet.oneOnOneBalance);
}

export function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && bStart < aEnd;
}

export async function activeInstructorIds(ctx: QueryCtx) {
  const instructors = await ctx.db
    .query("appProfiles")
    .withIndex("by_role", (q) => q.eq("role", "instructor"))
    .take(LIMITS.MAX_INSTRUCTORS);
  const admins = await ctx.db
    .query("appProfiles")
    .withIndex("by_role", (q) => q.eq("role", "admin"))
    .take(LIMITS.MAX_ADMINS_CHECK);
  return [...instructors, ...admins]
    .filter((profile) => profile.role === "admin" || profile.instructorDisabledAt === undefined)
    .map((profile) => profile.userId);
}

export async function hasLiveClassConflict(
  ctx: QueryCtx | MutationCtx,
  instructorUserId: Id<"users">,
  startsAt: number,
  endsAt: number,
  excludeLiveClassId?: Id<"liveClasses">,
) {
  const classes = await ctx.db
    .query("liveClasses")
    .withIndex("by_instructorUserId_and_startsAt", (q) =>
      q.eq("instructorUserId", instructorUserId).gte("startsAt", startsAt - dayMs).lt("startsAt", endsAt + dayMs),
    )
    .take(LIMITS.INSTRUCTOR_CLASSES);
  return classes.some((liveClass) =>
    liveClass._id !== excludeLiveClassId &&
    liveClass.status !== "cancelled" &&
    overlaps(startsAt, endsAt, liveClass.startsAt, liveClass.endsAt),
  );
}

export async function isOneOnOneSlotFree(
  ctx: QueryCtx | MutationCtx,
  instructorUserId: Id<"users">,
  startsAt: number,
  endsAt: number,
) {
  if (await hasLiveClassConflict(ctx, instructorUserId, startsAt, endsAt)) return false;

  const requests = await ctx.db
    .query("oneOnOneRequests")
    .withIndex("by_instructorUserId_and_requestedStartsAt", (q) =>
      q.eq("instructorUserId", instructorUserId).gte("requestedStartsAt", startsAt - dayMs).lt("requestedStartsAt", endsAt + dayMs),
    )
    .take(LIMITS.INSTRUCTOR_REQUESTS);
  return !requests.some((request) =>
    (request.status === "pending" || request.status === "approved") &&
    overlaps(startsAt, endsAt, request.requestedStartsAt, request.requestedEndsAt),
  );
}

export async function slotMatchesAvailability(
  ctx: QueryCtx | MutationCtx,
  instructorUserId: Id<"users">,
  startsAt: number,
  endsAt: number,
) {
  if (endsAt - startsAt !== oneOnOneLessonDurationMs) return false;

  const rules = await ctx.db
    .query("oneOnOneAvailabilityRules")
    .withIndex("by_instructorUserId_and_weekday", (q) =>
      q.eq("instructorUserId", instructorUserId).eq("weekday", weekday(startsAt)),
    )
    .take(LIMITS.MAX_INSTRUCTORS);
  const dayStart = startOfLocalDay(startsAt);
  return rules.some((rule) => {
    if (!rule.isActive) return false;
    const windowStart = dayStart + rule.startMinute * minuteMs;
    const windowEnd = dayStart + rule.endMinute * minuteMs;
    return startsAt >= windowStart && endsAt <= windowEnd;
  });
}

export async function buildDayAvailabilityWindows(
  ctx: QueryCtx,
  from: number,
  to: number,
  availableCredits: number,
): Promise<OneOnOneDayWindow[]> {
  const instructorIds = await activeInstructorIds(ctx);
  const instructorIdSet = new Set(instructorIds);
  const instructorProfiles = await loadInstructorProfiles(ctx, instructorIds);
  const windows: OneOnOneDayWindow[] = [];
  const now = Date.now();
  const minLead = MS.TWO_HOURS;
  const horizonEnd =
    startOfLocalDay(now) + (RULES.ONE_ON_ONE_MAX_ADVANCE_DAYS + 1) * dayMs;
  const effectiveTo = Math.min(to, horizonEnd);

  for (let dayStart = startOfLocalDay(from); dayStart < effectiveTo; dayStart += dayMs) {
    const rules = await ctx.db
      .query("oneOnOneAvailabilityRules")
      .withIndex("by_isActive_and_weekday", (q) => q.eq("isActive", true).eq("weekday", weekday(dayStart)))
      .take(LIMITS.CRON_ONE_ON_ONE);

    const byInstructor = new Map<
      Id<"users">,
      { windowStartsAt: number; windowEndsAt: number }
    >();

    for (const rule of rules) {
      if (!instructorIdSet.has(rule.instructorUserId)) continue;
      const windowStartsAt = dayStart + rule.startMinute * minuteMs;
      const windowEndsAt = dayStart + rule.endMinute * minuteMs;
      if (windowEndsAt <= windowStartsAt) continue;

      const existing = byInstructor.get(rule.instructorUserId);
      if (existing === undefined) {
        byInstructor.set(rule.instructorUserId, { windowStartsAt, windowEndsAt });
      } else {
        existing.windowStartsAt = Math.min(existing.windowStartsAt, windowStartsAt);
        existing.windowEndsAt = Math.max(existing.windowEndsAt, windowEndsAt);
      }
    }

    for (const [instructorUserId, span] of byInstructor) {
      const latestBookableStartAt = span.windowEndsAt - oneOnOneLessonDurationMs;
      const earliestBookableAt = Math.max(span.windowStartsAt, now + minLead);
      if (latestBookableStartAt < earliestBookableAt) continue;
      if (latestBookableStartAt < from || span.windowStartsAt >= to) continue;

      const instructor = instructorProfiles.get(instructorUserId as string);

      windows.push({
        dayStart,
        instructorUserId,
        instructorDisplayName: instructor?.displayName ?? "המדריכה",
        instructorAvatarUrl: instructor?.avatarUrl ?? null,
        windowStartsAt: span.windowStartsAt,
        windowEndsAt: span.windowEndsAt,
        lessonDurationMs: oneOnOneLessonDurationMs,
        earliestBookableAt,
        latestBookableStartAt,
        availableCredits,
      });
    }
  }

  return windows.sort((a, b) => a.dayStart - b.dayStart || a.windowStartsAt - b.windowStartsAt);
}

export async function buildAvailableSlots(
  ctx: QueryCtx,
  from: number,
  to: number,
  availableCredits: number,
) {
  const instructorIds = await activeInstructorIds(ctx);
  const instructorIdSet = new Set(instructorIds);
  const instructorNames = new Map<Id<"users">, string>();
  const slots: AvailableOneOnOneSlot[] = [];

  async function instructorDisplayName(instructorUserId: Id<"users">) {
    const cached = instructorNames.get(instructorUserId);
    if (cached !== undefined) return cached;
    const profiles = await ctx.db
      .query("appProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", instructorUserId))
      .take(1);
    const name = profiles[0]?.displayName ?? "המדריכה";
    instructorNames.set(instructorUserId, name);
    return name;
  }

  for (let dayStart = startOfLocalDay(from); dayStart < to; dayStart += dayMs) {
    const rules = await ctx.db
      .query("oneOnOneAvailabilityRules")
      .withIndex("by_isActive_and_weekday", (q) => q.eq("isActive", true).eq("weekday", weekday(dayStart)))
      .take(LIMITS.CRON_ONE_ON_ONE);

    for (const rule of rules) {
      if (!instructorIdSet.has(rule.instructorUserId)) continue;
      const step = (rule.slotMinutes + rule.bufferMinutes) * minuteMs;
      const duration = rule.slotMinutes * minuteMs;
      for (
        let startsAt = dayStart + rule.startMinute * minuteMs;
        startsAt + duration <= dayStart + rule.endMinute * minuteMs;
        startsAt += step
      ) {
        const endsAt = startsAt + duration;
        if (startsAt < from || endsAt > to) continue;
        if (startsAt <= Date.now() + MS.TWO_HOURS) continue;
        if (!(await isOneOnOneSlotFree(ctx, rule.instructorUserId, startsAt, endsAt))) continue;
        slots.push({
          instructorUserId: rule.instructorUserId,
          instructorDisplayName: await instructorDisplayName(rule.instructorUserId),
          startsAt,
          endsAt,
          availableCredits,
        });
      }
    }
  }

  return slots.sort((a, b) => a.startsAt - b.startsAt).slice(0, 80);
}
