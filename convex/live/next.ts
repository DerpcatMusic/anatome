import { v } from "convex/values";
import { query } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { isInLiveJoinWindow } from "../lib/liveJoin";
import { isLiveSidebarEligible, pickBestSidebarLiveClass } from "../lib/liveSidebar";
import { viewerCanAccessLiveClass } from "../lib/equipment";
import { requireQueryNow } from "../lib/queryNow";
import type { Doc } from "../_generated/dataModel";

const nextLivePayloadValidator = v.object({
  classId: v.id("liveClasses"),
  title: v.string(),
  status: v.union(
    v.literal("draft"),
    v.literal("scheduled"),
    v.literal("live"),
    v.literal("ended"),
    v.literal("cancelled"),
  ),
  startsAt: v.number(),
  joinOpensAt: v.number(),
  joinClosesAt: v.number(),
  type: v.union(v.literal("group_live"), v.literal("one_on_one")),
});

function toNextLivePayload(
  liveClass: Doc<"liveClasses">,
  now: number,
  options?: { memberView?: boolean },
) {
  const eligible = options?.memberView
    ? liveClass.status === "live" && isInLiveJoinWindow(liveClass, now)
    : isLiveSidebarEligible(liveClass, now);
  if (!eligible) return null;
  return {
    classId: liveClass._id,
    title: liveClass.title,
    status: liveClass.status,
    startsAt: liveClass.startsAt,
    joinOpensAt: liveClass.joinOpensAt,
    joinClosesAt: liveClass.joinClosesAt,
    type: liveClass.type,
  };
}

export const get = query({
  args: {
    now: v.number(),
  },
  returns: v.union(v.null(), nextLivePayloadValidator),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    const now = requireQueryNow(args.now);

    const profiles = await ctx.db
      .query("appProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .take(1);
    const profile = profiles[0] ?? null;

    if (profile?.role === "instructor" || profile?.role === "admin") {
      const ownClasses: Doc<"liveClasses">[] = [];

      const live = await ctx.db
        .query("liveClasses")
        .withIndex("by_instructorUserId_and_status_and_startsAt", (q) =>
          q.eq("instructorUserId", userId).eq("status", "live"),
        )
        .order("asc")
        .take(10);
      ownClasses.push(...live);

      const scheduled = await ctx.db
        .query("liveClasses")
        .withIndex("by_instructorUserId_and_status_and_startsAt", (q) =>
          q.eq("instructorUserId", userId).eq("status", "scheduled"),
        )
        .order("asc")
        .take(30);
      ownClasses.push(...scheduled);

      const best = pickBestSidebarLiveClass(ownClasses, now);
      if (best === null) return null;
      return toNextLivePayload(best, now);
    }

    const memberProfiles = await ctx.db
      .query("memberProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .take(1);
    const memberEquipment = memberProfiles[0]?.equipment ?? [];

    const reservations = await ctx.db
      .query("liveReservations")
      .withIndex("by_userId_and_reservedAt", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);

    const memberCandidates: Doc<"liveClasses">[] = [];
    const activeReservations = reservations.filter(
      (reservation) => reservation.status === "reserved" || reservation.status === "joined",
    );
    const reservedClassIds = [
      ...new Set(activeReservations.map((reservation) => reservation.liveClassId)),
    ];
    const reservedClasses = await Promise.all(
      reservedClassIds.map((classId) => ctx.db.get(classId)),
    );
    const reservedClassById = new Map(
      reservedClasses
        .filter((liveClass): liveClass is Doc<"liveClasses"> => liveClass !== null)
        .map((liveClass) => [liveClass._id, liveClass]),
    );

    for (const reservation of activeReservations) {
      const liveClass = reservedClassById.get(reservation.liveClassId);
      if (liveClass === undefined) continue;
      if (!viewerCanAccessLiveClass(memberEquipment, liveClass.requiredEquipment)) {
        continue;
      }
      memberCandidates.push(liveClass);
    }

    const best = pickBestSidebarLiveClass(memberCandidates, now, { memberView: true });
    if (best === null) return null;
    return toNextLivePayload(best, now, { memberView: true });
  },
});
