import { query } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { isLiveSidebarEligible } from "../lib/liveSidebar";
import type { Doc } from "../_generated/dataModel";

function toNextLivePayload(liveClass: Doc<"liveClasses">, now: number) {
  if (!isLiveSidebarEligible(liveClass, now)) return null;
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
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    const now = Date.now();

    const profiles = await ctx.db
      .query("appProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .take(1);
    const profile = profiles[0] ?? null;

    if (profile?.role === "instructor" || profile?.role === "admin") {
      const live = await ctx.db
        .query("liveClasses")
        .withIndex("by_instructorUserId_and_status_and_startsAt", (q) =>
          q.eq("instructorUserId", userId).eq("status", "live"),
        )
        .order("asc")
        .take(10);
      for (const row of live) {
        const hit = toNextLivePayload(row, now);
        if (hit) return hit;
      }

      const scheduled = await ctx.db
        .query("liveClasses")
        .withIndex("by_instructorUserId_and_status_and_startsAt", (q) =>
          q.eq("instructorUserId", userId).eq("status", "scheduled"),
        )
        .order("asc")
        .take(30);
      for (const row of scheduled) {
        const hit = toNextLivePayload(row, now);
        if (hit) return hit;
      }
    }

    const reservations = await ctx.db
      .query("liveReservations")
      .withIndex("by_userId_and_reservedAt", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);

    const liveClasses = await Promise.all(
      reservations.map((r) => ctx.db.get(r.liveClassId)),
    );

    for (let i = 0; i < reservations.length; i++) {
      const reservation = reservations[i];
      if (reservation.status !== "reserved" && reservation.status !== "joined")
        continue;
      const liveClass = liveClasses[i];
      if (liveClass === null) continue;
      const hit = toNextLivePayload(liveClass, now);
      if (hit) return hit;
    }

    return null;
  },
});
