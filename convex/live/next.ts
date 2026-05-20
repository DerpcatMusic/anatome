import { query } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    const now = Date.now();
    const profile = await ctx.db
      .query("appProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (profile?.role === "instructor" || profile?.role === "admin") {
      const next = await ctx.db
        .query("liveClasses")
        .withIndex("by_instructorUserId_and_startsAt", (q) =>
          q.eq("instructorUserId", userId).gte("startsAt", now - 30 * 60_000),
        )
        .order("asc")
        .take(1);
      if (next.length > 0 && next[0].joinOpensAt <= now + 60 * 60_000) {
        return {
          classId: next[0]._id,
          title: next[0].title,
          status: next[0].status,
          startsAt: next[0].startsAt,
        };
      }
    }

    const reservations = await ctx.db
      .query("liveReservations")
      .withIndex("by_userId_and_reservedAt", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);

    for (const reservation of reservations) {
      if (reservation.status !== "reserved" && reservation.status !== "joined")
        continue;
      const liveClass = await ctx.db.get(reservation.liveClassId);
      if (liveClass === null) continue;
      if (liveClass.status === "ended" || liveClass.status === "cancelled")
        continue;
      if (liveClass.joinOpensAt > now + 60 * 60_000) continue;
      return {
        classId: liveClass._id,
        title: liveClass.title,
        status: liveClass.status,
        startsAt: liveClass.startsAt,
      };
    }

    return null;
  },
});
