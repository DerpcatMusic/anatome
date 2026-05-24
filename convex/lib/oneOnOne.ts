import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { LIMITS } from "../lib/constants";

export const oneOnOneTimezone = "Asia/Jerusalem";
export const dayMs = 24 * 60 * 60 * 1000;
export const minuteMs = 60 * 1000;

export type AvailableOneOnOneSlot = {
  instructorUserId: Id<"users">;
  startsAt: number;
  endsAt: number;
  availableCredits: number;
};

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
  const rules = await ctx.db
    .query("oneOnOneAvailabilityRules")
    .withIndex("by_instructorUserId_and_weekday", (q) =>
      q.eq("instructorUserId", instructorUserId).eq("weekday", weekday(startsAt)),
    )
    .take(LIMITS.MAX_INSTRUCTORS);
  const dayStart = startOfLocalDay(startsAt);
  return rules.some((rule) => {
    if (!rule.isActive) return false;
    const duration = rule.slotMinutes * minuteMs;
    const step = (rule.slotMinutes + rule.bufferMinutes) * minuteMs;
    if (endsAt - startsAt !== duration) return false;
    const first = dayStart + rule.startMinute * minuteMs;
    const lastEnd = dayStart + rule.endMinute * minuteMs;
    return startsAt >= first && endsAt <= lastEnd && (startsAt - first) % step === 0;
  });
}

export async function buildAvailableSlots(
  ctx: QueryCtx,
  from: number,
  to: number,
  availableCredits: number,
) {
  const instructorIds = await activeInstructorIds(ctx);
  const instructorIdSet = new Set(instructorIds);
  const slots: AvailableOneOnOneSlot[] = [];

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
        if (!(await isOneOnOneSlotFree(ctx, rule.instructorUserId, startsAt, endsAt))) continue;
        slots.push({ instructorUserId: rule.instructorUserId, startsAt, endsAt, availableCredits });
      }
    }
  }

  return slots.sort((a, b) => a.startsAt - b.startsAt).slice(0, 80);
}
