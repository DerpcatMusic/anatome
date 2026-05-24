import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { requireAppProfile, requireRole, requireUserId } from "../lib/authz";
import {
  requireWalletForMember,
  availableLiveCredits,
  availableOneOnOneCredits,
  reserveCredits,
  releaseCredits,
  type LiveCreditPool,
} from "../credits/lib";
import { reserveClassSeat, releaseClassSeats } from "./capacity";
import { missingRequiredEquipment } from "../lib/equipment";
import { MS, RULES, LIMITS } from "../lib/constants";
import { checkRateLimit } from "../lib/rateLimit";
import { createReminderEventsForReservation } from "../liveReminders/create";

async function findReservationForUser(
  ctx: MutationCtx,
  liveClassId: Id<"liveClasses">,
  userId: Id<"users">,
) {
  const rows = await ctx.db
    .query("liveReservations")
    .withIndex("by_liveClassId_and_userId", (q) =>
      q.eq("liveClassId", liveClassId).eq("userId", userId),
    )
    .take(10);

  return (
    rows.find((row) => row.status === "joined") ??
    rows.find((row) => row.status === "reserved") ??
    rows[0] ??
    null
  );
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
    const memberProfiles = await ctx.db
      .query("memberProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .take(1);
    const memberProfile = memberProfiles[0] ?? null;
    if (memberProfile === null) throw new Error("נדרש פרופיל פילאטיס");
    if (
      missingRequiredEquipment(memberProfile.equipment, liveClass.requiredEquipment)
        .length > 0
    ) {
      throw new Error("חסר ציוד נדרש");
    }

    const existing = await findReservationForUser(ctx, args.liveClassId, userId);

    if (
      existing !== null &&
      (existing.status === "reserved" || existing.status === "joined")
    ) {
      return existing._id;
    }

    const { wallet } = await requireWalletForMember(ctx, userId);
    const creditKind: LiveCreditPool =
      liveClass.creditKind === "live" ? "live" : "oneOnOne";
    const available =
      creditKind === "live"
        ? availableLiveCredits(wallet)
        : availableOneOnOneCredits(wallet);
    if (available < liveClass.creditCost) {
      throw new Error("אין מספיק נקודות");
    }

    const now = Date.now();
    await reserveCredits(ctx, wallet._id, creditKind, liveClass.creditCost);

    let reservationId: Id<"liveReservations">;
    if (existing !== null) {
      await ctx.db.patch(existing._id, {
        walletId: wallet._id,
        status: "reserved",
        creditKind: liveClass.creditKind,
        creditsReserved: liveClass.creditCost,
        reservedAt: now,
      });
      reservationId = existing._id;
    } else {
      reservationId = await ctx.db.insert("liveReservations", {
        liveClassId: args.liveClassId,
        userId,
        walletId: wallet._id,
        status: "reserved",
        creditKind: liveClass.creditKind,
        creditsReserved: liveClass.creditCost,
        reservedAt: now,
      });
    }
    await reserveClassSeat(ctx, args.liveClassId);

    await createReminderEventsForReservation(
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
    const reservation = await findReservationForUser(ctx, args.liveClassId, userId);

    if (reservation === null || reservation.status !== "reserved") {
      throw new Error("Active reservation not found");
    }

    const liveClass = await ctx.db.get(args.liveClassId);

    const creditKind: LiveCreditPool =
      reservation.creditKind === "live" ? "live" : "oneOnOne";
    await releaseCredits(
      ctx,
      reservation.walletId,
      creditKind,
      reservation.creditsReserved,
    );

    await ctx.db.patch(reservation._id, {
      status: "cancelled",
      cancelledAt: Date.now(),
    });

    if (liveClass !== null) {
      await releaseClassSeats(ctx, args.liveClassId);
    }

    const reminders = await ctx.db
      .query("liveReminderEvents")
      .withIndex("by_reservationId", (q) =>
        q.eq("reservationId", reservation._id),
      )
      .take(10);
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
