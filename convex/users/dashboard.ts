import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "../_generated/server";
import { LIMITS } from "../lib/constants";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    const user = await ctx.db.get(userId);
    const appProfile = await ctx.db
      .query("appProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    const profile = await ctx.db
      .query("memberProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    const now = Date.now();
    const reservations = await ctx.db
      .query("liveReservations")
      .withIndex("by_userId_and_status", (q) => q.eq("userId", userId).eq("status", "reserved"))
      .order("desc")
      .take(LIMITS.DASHBOARD_RESERVATIONS);

    let liveAlert: { liveClassId: string; title: string; startsAt: number } | null = null;

    if (reservations.length > 0) {
      const liveClasses = await ctx.db
        .query("liveClasses")
        .withIndex("by_status_and_startsAt", (q) => q.eq("status", "live"))
        .take(LIMITS.DASHBOARD_LIVE_CLASSES);
      const liveClassMap = new Map(liveClasses.map((c) => [c._id, c]));

      for (const reservation of reservations) {
        const liveClass = liveClassMap.get(reservation.liveClassId);
        if (liveClass !== undefined && now >= liveClass.joinOpensAt && now <= liveClass.joinClosesAt) {
          liveAlert = { liveClassId: liveClass._id, title: liveClass.title, startsAt: liveClass.startsAt };
          break;
        }
      }
    }

    const role = appProfile?.role ?? "customer";
    return {
      user,
      profile,
      role,
      appProfile: appProfile
        ? {
            displayName: appProfile.displayName,
            credentials: appProfile.credentials,
            certificateDocument: appProfile.certificateDocument,
            insuranceDocument: appProfile.insuranceDocument,
          }
        : null,
      needsOnboarding: profile === null && role === "customer",
      liveAlert,
    };
  },
});
