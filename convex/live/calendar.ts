import { v } from "convex/values";
import { query } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import {
  getCurrentCreditBucket,
  availableLiveCredits,
  availableOneOnOneCredits,
} from "../credits/lib";
import { missingRequiredEquipment } from "../lib/equipment";

export const listUpcoming = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const scheduled = await ctx.db
      .query("liveClasses")
      .withIndex("by_status_and_startsAt", (q) =>
        q.eq("status", "scheduled").gte("startsAt", now),
      )
      .order("asc")
      .take(50);
    const live = await ctx.db
      .query("liveClasses")
      .withIndex("by_status_and_startsAt", (q) => q.eq("status", "live"))
      .order("asc")
      .take(50);

    return [...live, ...scheduled].sort((a, b) => a.startsAt - b.startsAt).slice(0, 50);
  },
});

export const listRange = query({
  args: {
    from: v.number(),
    to: v.number(),
  },
  handler: async (ctx, args) => {
    if (args.from >= args.to) {
      throw new Error("Invalid calendar range");
    }

    const userId = await getAuthUserId(ctx);
    const classes = await ctx.db
      .query("liveClasses")
      .withIndex("by_startsAt", (q) =>
        q.gte("startsAt", args.from).lt("startsAt", args.to),
      )
      .order("asc")
      .take(100);

    const bucket =
      userId === null ? null : await getCurrentCreditBucket(ctx, userId);

    const viewerReservations =
      userId === null
        ? []
        : await ctx.db
            .query("liveReservations")
            .withIndex("by_userId_and_reservedAt", (q) => q.eq("userId", userId))
            .take(200);
    const viewerReservationMap = new Map(
      viewerReservations.map((r) => [r.liveClassId, r]),
    );

    const memberProfile =
      userId === null
        ? null
        : await ctx.db
            .query("memberProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .unique();
    const appProfile =
      userId === null
        ? null
        : await ctx.db
            .query("appProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .unique();
    const now = Date.now();

    const results = [];
    for (const liveClass of classes) {
      const seatsTaken = liveClass.seatsTaken ?? 0;
      const viewerReservation = viewerReservationMap.get(liveClass._id) ?? null;
      const available =
        bucket === null
          ? 0
          : liveClass.creditKind === "live"
            ? availableLiveCredits(bucket)
            : availableOneOnOneCredits(bucket);
      const viewerReservationStatus = viewerReservation?.status ?? null;
      const viewerMissingEquipment = missingRequiredEquipment(
        memberProfile?.equipment ?? [],
        liveClass.requiredEquipment,
      );

      const seatsRemaining = Math.max(0, liveClass.capacity - seatsTaken);
      const hasValidReservation =
        viewerReservationStatus !== null &&
        viewerReservationStatus !== "cancelled" &&
        viewerReservationStatus !== "refunded" &&
        viewerReservationStatus !== "no_show";
      const canWalkIn =
        userId !== null &&
        liveClass.status === "live" &&
        now >= liveClass.joinOpensAt &&
        now <= liveClass.joinClosesAt &&
        seatsRemaining > 0 &&
        available >= liveClass.creditCost &&
        viewerMissingEquipment.length === 0;

      results.push({
        liveClass,
        seatsTaken,
        seatsRemaining,
        viewerReservationStatus,
        viewerCanReserve:
          userId !== null &&
          viewerReservationStatus === null &&
          (liveClass.status === "scheduled" || liveClass.status === "live") &&
          seatsTaken < liveClass.capacity &&
          viewerMissingEquipment.length === 0 &&
          available >= liveClass.creditCost,
        viewerCanJoin:
          userId !== null &&
          (liveClass.type === "group_live" || liveClass.type === "one_on_one") &&
          liveClass.status === "live" &&
          now >= liveClass.joinOpensAt &&
          now <= liveClass.joinClosesAt &&
          (hasValidReservation || canWalkIn),
        viewerIsWalkIn: !hasValidReservation && canWalkIn,
        viewerAvailableCredits: available,
        viewerMissingEquipment,
        viewerRole: appProfile?.role ?? null,
      });
    }

    return results;
  },
});
