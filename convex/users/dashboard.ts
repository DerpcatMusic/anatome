import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "../_generated/server";
import { LIMITS } from "../lib/constants";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    const user = await ctx.db.get(userId);
    const appProfiles = await ctx.db
      .query("appProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .take(1);
    const appProfile = appProfiles[0] ?? null;
    const profiles = await ctx.db
      .query("memberProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .take(1);
    const profile = profiles[0] ?? null;
    const subscriptions = await ctx.db
      .query("userSubscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(5);
    const subscription = subscriptions.find((row) =>
      row.status === "trialing" || row.status === "active"
    ) ?? null;
    const subscriptionPlan = subscription ? await ctx.db.get(subscription.planId) : null;
    const pendingSubscriptionPlan = subscription?.pendingPlanId
      ? await ctx.db.get(subscription.pendingPlanId)
      : null;
    const creditBucket = subscription
      ? (
          await ctx.db
            .query("creditBuckets")
            .withIndex("by_user_period", (q) =>
              q.eq("userId", userId).eq("periodStart", subscription.currentPeriodStart),
            )
            .take(1)
        )[0] ?? null
      : null;
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
        if (liveClass !== undefined) {
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
      subscription,
      subscriptionPlan,
      pendingSubscriptionPlan,
      creditBucket,
    };
  },
});
