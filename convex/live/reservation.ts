import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { requireAppProfile, requireRole, requireUserId } from "../lib/authz";
import {
  getCurrentCreditBucket,
  availableLiveCredits,
  availableOneOnOneCredits,
} from "../credits/lib";
import { reserveLiveCredits } from "../credits/reserveLive";
import { reserveOneOnOneCredits } from "../credits/reserveOneOnOne";
import { releaseLiveCredits } from "../credits/releaseLive";
import { releaseOneOnOneCredits } from "../credits/releaseOneOnOne";
import { missingRequiredEquipment } from "../lib/equipment";
import { MS, RULES, LIMITS } from "../lib/constants";
import { checkRateLimit } from "../lib/rateLimit";

async function insertReminderEvents(
  ctx: MutationCtx,
  liveClassId: Id<"liveClasses">,
  reservationId: Id<"liveReservations">,
  userId: Id<"users">,
  startsAt: number,
) {
  const now = Date.now();
  const reminders = [
    { kind: "day_before" as const, sendAt: startsAt - 24 * 60 * 60 * 1000 },
    { kind: "thirty_minutes" as const, sendAt: startsAt - 30 * 60 * 1000 },
  ].filter((reminder) => reminder.sendAt > now);

  for (const reminder of reminders) {
    await ctx.db.insert("liveReminderEvents", {
      liveClassId,
      reservationId,
      userId,
      kind: reminder.kind,
      sendAt: reminder.sendAt,
      status: "pending",
      createdAt: now,
    });
  }
}

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    return await ctx.db
      .query("liveReservations")
      .withIndex("by_userId_and_reservedAt", (q) => q.eq("userId", userId))
      .order("desc")
      .take(LIMITS.LIVE_PARTICIPANTS);
  },
});

export const reserve = mutation({
  args: {
    liveClassId: v.id("liveClasses"),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    await checkRateLimit(ctx, userId, "reservation");
    const profile = await requireAppProfile(ctx, userId);
    requireRole(profile, ["customer", "instructor", "admin"]);

    const liveClass = await ctx.db.get(args.liveClassId);
    if (liveClass === null) throw new Error("השיעור לא נמצא");
    if (liveClass.status !== "scheduled" && liveClass.status !== "live") {
      throw new Error("השיעור אינו זמין");
    }
    if (Date.now() > liveClass.joinClosesAt) {
      throw new Error("חלון ההרשמה לשיעור נסגר");
    }
    const memberProfile = await ctx.db
      .query("memberProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (memberProfile === null) throw new Error("נדרש פרופיל פילאטיס");
    if (
      missingRequiredEquipment(memberProfile.equipment, liveClass.requiredEquipment)
        .length > 0
    ) {
      throw new Error("חסר ציוד נדרש");
    }

    const existing = await ctx.db
      .query("liveReservations")
      .withIndex("by_liveClassId_and_userId", (q) =>
        q.eq("liveClassId", args.liveClassId).eq("userId", userId),
      )
      .unique();

    if (
      existing !== null &&
      (existing.status === "reserved" || existing.status === "joined")
    ) {
      return existing._id;
    }

    const allReservations = await ctx.db
      .query("liveReservations")
      .withIndex("by_liveClassId_and_status", (q) =>
        q.eq("liveClassId", args.liveClassId),
      )
      .take(liveClass.capacity + 1);
    const activeCount = allReservations.filter(
      (r) => r.status === "reserved" || r.status === "joined",
    ).length;
    if (activeCount >= liveClass.capacity) {
      throw new Error("השיעור מלא");
    }

    const bucket = await getCurrentCreditBucket(ctx, userId);
    if (bucket === null) throw new Error("אין תיק נקודות פעיל");
    const available =
      liveClass.creditKind === "live"
        ? availableLiveCredits(bucket)
        : availableOneOnOneCredits(bucket);
    if (available < liveClass.creditCost) {
      throw new Error("אין מספיק נקודות");
    }

    const now = Date.now();
    if (liveClass.creditKind === "live") {
      await reserveLiveCredits(ctx, bucket, liveClass.creditCost);
    } else {
      await reserveOneOnOneCredits(ctx, bucket, liveClass.creditCost);
    }

    const reservationId = await ctx.db.insert("liveReservations", {
      liveClassId: args.liveClassId,
      userId,
      creditBucketId: bucket._id,
      status: "reserved",
      creditKind: liveClass.creditKind,
      creditsReserved: liveClass.creditCost,
      reservedAt: now,
    });
    await ctx.db.patch(args.liveClassId, { seatsTaken: activeCount + 1 });

    // Idempotency / race-condition defence: re-verify capacity after insert
    const postCheck = await ctx.db
      .query("liveReservations")
      .withIndex("by_liveClassId_and_status", (q) =>
        q.eq("liveClassId", args.liveClassId),
      )
      .collect();
    const postActive = postCheck.filter((r) => r.status === "reserved" || r.status === "joined").length;
    if (postActive > liveClass.capacity) {
      // Rollback: we lost the race
      if (liveClass.creditKind === "live") {
        await releaseLiveCredits(ctx, bucket, liveClass.creditCost);
      } else {
        await releaseOneOnOneCredits(ctx, bucket, liveClass.creditCost);
      }
      await ctx.db.delete(reservationId);
      await ctx.db.patch(args.liveClassId, { seatsTaken: Math.max(0, postActive - 1) });
      throw new Error("Class is full");
    }

    await insertReminderEvents(
      ctx,
      args.liveClassId,
      reservationId,
      userId,
      liveClass.startsAt,
    );
    return reservationId;
  },
});

export const cancel = mutation({
  args: {
    liveClassId: v.id("liveClasses"),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const reservation = await ctx.db
      .query("liveReservations")
      .withIndex("by_liveClassId_and_userId", (q) =>
        q.eq("liveClassId", args.liveClassId).eq("userId", userId),
      )
      .unique();

    if (reservation === null || reservation.status !== "reserved") {
      throw new Error("Active reservation not found");
    }

    const liveClass = await ctx.db.get(args.liveClassId);

    const bucket = await ctx.db.get(reservation.creditBucketId);
    if (bucket !== null) {
      if (reservation.creditKind === "live") {
        await releaseLiveCredits(ctx, bucket, reservation.creditsReserved);
      } else {
        await releaseOneOnOneCredits(ctx, bucket, reservation.creditsReserved);
      }
    }

    await ctx.db.patch(reservation._id, {
      status: "cancelled",
      cancelledAt: Date.now(),
    });

    if (liveClass !== null) {
      await ctx.db.patch(args.liveClassId, {
        seatsTaken: Math.max(0, (liveClass.seatsTaken ?? 0) - 1),
      });
    }

    const reminders = await ctx.db
      .query("liveReminderEvents")
      .withIndex("by_reservationId", (q) =>
        q.eq("reservationId", reservation._id),
      )
      .collect();
    for (const reminder of reminders) {
      if (reminder.status === "pending") {
        await ctx.db.patch(reminder._id, {
          status: "cancelled",
          processedAt: Date.now(),
        });
      }
    }

    return reservation._id;
  },
});
