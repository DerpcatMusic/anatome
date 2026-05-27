import { v } from "convex/values";
import { query } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import {
  availableLiveCredits,
  availableOneOnOneCredits,
  getCreditAccess,
} from "../credits/lib";
import {
  missingRequiredEquipment,
  viewerCanAccessLiveClass,
} from "../lib/equipment";
import { LIMITS } from "../lib/constants";
import { isInLiveJoinWindow } from "../lib/liveJoin";
import { loadInstructorProfiles } from "../lib/instructorProfile";
import {
  isValidLiveReservation,
  viewerCanSeeLiveClass,
  viewerIsLiveStaff,
} from "../lib/liveClassAccess";
import { requireQueryNow } from "../lib/queryNow";
import { broadcastMetaForClass, viewerIsInstructorForClass } from "./joinAccess";

export const listUpcoming = query({
  args: {
    now: v.number(),
  },
  handler: async (ctx, args) => {
    const now = requireQueryNow(args.now);
    const scheduled = await ctx.db
      .query("liveClasses")
      .withIndex("by_status_and_startsAt", (q) =>
        q.eq("status", "scheduled").gte("startsAt", now),
      )
      .order("asc")
      .take(LIMITS.CALENDAR_UPCOMING);
    const live = await ctx.db
      .query("liveClasses")
      .withIndex("by_status_and_startsAt", (q) => q.eq("status", "live"))
      .order("asc")
      .take(LIMITS.CALENDAR_UPCOMING);

    const classes = [...live, ...scheduled]
      .filter((liveClass) => liveClass.endsAt > now)
      .sort((a, b) => a.startsAt - b.startsAt)
      .slice(0, 50);

    const userId = await getAuthUserId(ctx);
    const isStaff = userId === null ? false : await viewerIsLiveStaff(ctx, userId);

    const viewerReservationClassIds = new Set<string>();
    if (userId !== null) {
      const viewerReservations = await ctx.db
        .query("liveReservations")
        .withIndex("by_userId_and_reservedAt", (q) => q.eq("userId", userId))
        .take(LIMITS.CALENDAR_RESERVATIONS);
      for (const reservation of viewerReservations) {
        if (isValidLiveReservation(reservation)) {
          viewerReservationClassIds.add(reservation.liveClassId);
        }
      }
    }

    let memberEquipment: string[] = [];
    if (userId !== null) {
      const memberProfiles = await ctx.db
        .query("memberProfiles")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .take(1);
      memberEquipment = memberProfiles[0]?.equipment ?? [];
    }

    const visible = [];
    for (const liveClass of classes) {
      if (liveClass.type === "one_on_one") {
        if (userId === null) continue;
        if (!isStaff && !viewerReservationClassIds.has(liveClass._id)) continue;
      }
      if (!(await viewerCanSeeLiveClass(ctx, liveClass, userId))) continue;
      if (!viewerCanAccessLiveClass(memberEquipment, liveClass.requiredEquipment)) {
        continue;
      }
      visible.push(liveClass);
    }

    return visible;
  },
});

export const listRange = query({
  args: {
    from: v.number(),
    to: v.number(),
    now: v.number(),
  },
  handler: async (ctx, args) => {
    if (args.from >= args.to) {
      throw new Error("Invalid calendar range");
    }

    const now = requireQueryNow(args.now);
    const userId = await getAuthUserId(ctx);
    const classes = await ctx.db
      .query("liveClasses")
      .withIndex("by_startsAt", (q) =>
        q.gte("startsAt", args.from).lt("startsAt", args.to),
      )
      .order("asc")
      .take(LIMITS.CALENDAR_RANGE_CLASSES);

    const { wallet } =
      userId === null
        ? { wallet: null }
        : await getCreditAccess(ctx, userId, now);

    const viewerReservations =
      userId === null
        ? []
        : await ctx.db
            .query("liveReservations")
            .withIndex("by_userId_and_reservedAt", (q) => q.eq("userId", userId))
            .take(LIMITS.CALENDAR_RESERVATIONS);
    const viewerReservationMap = new Map(
      viewerReservations.map((r) => [r.liveClassId, r]),
    );

    const memberProfiles =
      userId === null
        ? []
        : await ctx.db
            .query("memberProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .take(1);
    const memberProfile = memberProfiles[0] ?? null;
    const appProfiles =
      userId === null
        ? []
        : await ctx.db
            .query("appProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .take(1);
    const appProfile = appProfiles[0] ?? null;
    const instructorProfiles = await loadInstructorProfiles(
      ctx,
      [...new Set(classes.map((c) => c.instructorUserId))],
    );

    const results = [];
    for (const liveClass of classes) {
      if (liveClass.status === "cancelled" || liveClass.status === "draft") {
        continue;
      }
      if (!(await viewerCanSeeLiveClass(ctx, liveClass, userId))) {
        continue;
      }
      const seatsTaken = liveClass.seatsTaken ?? 0;
      const viewerReservation = viewerReservationMap.get(liveClass._id) ?? null;
      const available =
        wallet === null
          ? 0
          : liveClass.creditKind === "live"
            ? availableLiveCredits(wallet)
            : availableOneOnOneCredits(wallet);
      const viewerReservationStatus = viewerReservation?.status ?? null;
      const memberEquipment = memberProfile?.equipment ?? [];
      const viewerMissingEquipment = missingRequiredEquipment(
        memberEquipment,
        liveClass.requiredEquipment,
      );
      const hasEquipmentAccess = viewerCanAccessLiveClass(
        memberEquipment,
        liveClass.requiredEquipment,
      );

      const seatsRemaining = Math.max(0, liveClass.capacity - seatsTaken);
      const hasValidReservation =
        viewerReservationStatus !== null &&
        viewerReservationStatus !== "cancelled" &&
        viewerReservationStatus !== "refunded" &&
        viewerReservationStatus !== "no_show";

      const isCustomerViewer =
        userId !== null &&
        (appProfile?.role === "customer" || appProfile?.role === undefined);
      if (isCustomerViewer && !hasEquipmentAccess && !hasValidReservation) {
        continue;
      }
      const inJoinWindow = isInLiveJoinWindow(liveClass, now);
      const isInstructor =
        userId !== null && viewerIsInstructorForClass(appProfile, liveClass, userId);
      let broadcastLive = false;
      if (liveClass.status === "live") {
        const broadcast = await broadcastMetaForClass(ctx, liveClass._id, liveClass.status);
        broadcastLive = broadcast.isBroadcastLive;
      }
      const instructor =
        instructorProfiles.get(liveClass.instructorUserId as string) ?? null;

      results.push({
        liveClass,
        instructorUserId: liveClass.instructorUserId,
        instructorDisplayName: instructor?.displayName ?? "המדריכה",
        instructorAvatarUrl: instructor?.avatarUrl ?? null,
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
          inJoinWindow &&
          hasEquipmentAccess &&
          hasValidReservation &&
          (isInstructor || broadcastLive),
        viewerIsWalkIn: false,
        viewerAvailableCredits: available,
        viewerMissingEquipment,
        viewerRole: appProfile?.role ?? null,
      });
    }

    return results;
  },
});
