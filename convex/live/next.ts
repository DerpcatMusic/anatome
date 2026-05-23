import { query } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

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
        .take(1);
      if (live[0] !== undefined) {
        return {
          classId: live[0]._id,
          title: live[0].title,
          status: live[0].status,
          startsAt: live[0].startsAt,
        };
      }
      const scheduled = await ctx.db
        .query("liveClasses")
        .withIndex("by_instructorUserId_and_status_and_startsAt", (q) =>
          q.eq("instructorUserId", userId).eq("status", "scheduled"),
        )
        .order("asc")
        .take(1);
      if (scheduled[0] !== undefined) {
        return {
          classId: scheduled[0]._id,
          title: scheduled[0].title,
          status: scheduled[0].status,
          startsAt: scheduled[0].startsAt,
        };
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
      if (liveClass.status === "ended" || liveClass.status === "cancelled")
        continue;
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
