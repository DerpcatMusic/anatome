import { query } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { isLiveSidebarEligible } from "../lib/liveSidebar";
import type { Doc } from "../_generated/dataModel";

// #region agent log
function agentLog(
  hypothesisId: string,
  location: string,
  message: string,
  data: Record<string, unknown>,
) {
  void fetch("http://127.0.0.1:7635/ingest/0058f30b-7dc0-4748-98aa-19722c5574a5", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "dcdf18" },
    body: JSON.stringify({
      sessionId: "dcdf18",
      hypothesisId,
      location,
      message,
      data,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
}
// #endregion

function toNextLivePayload(liveClass: Doc<"liveClasses">, branch: string, now: number) {
  const eligible = isLiveSidebarEligible(liveClass, now);
  const payload = {
    classId: liveClass._id,
    title: liveClass.title,
    status: liveClass.status,
    startsAt: liveClass.startsAt,
    joinOpensAt: liveClass.joinOpensAt,
    joinClosesAt: liveClass.joinClosesAt,
    type: liveClass.type,
  };
  // #region agent log
  agentLog("H1", "convex/live/next.ts:toNextLivePayload", "sidebar candidate", {
    branch,
    now,
    eligible,
    classId: liveClass._id.toString(),
    status: liveClass.status,
    startsAt: liveClass.startsAt,
    joinOpensAt: liveClass.joinOpensAt,
    joinClosesAt: liveClass.joinClosesAt,
  });
  // #endregion
  return eligible ? payload : null;
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
        const hit = toNextLivePayload(row, "instructor-live", now);
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
        const hit = toNextLivePayload(row, "instructor-scheduled", now);
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
      const hit = toNextLivePayload(liveClass, "customer-reservation", now);
      if (hit) return hit;
    }

    // #region agent log
    agentLog("H5", "convex/live/next.ts:done", "no eligible next live", {
      userId: userId.toString(),
      role: profile?.role ?? null,
    });
    // #endregion
    return null;
  },
});
