import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { internal } from "../_generated/api";
import { LIMITS } from "../lib/constants";
import { releaseLiveReservationHoldIfStillReserved } from "../credits/lib";

export async function settleReservationsForClass(
  ctx: MutationCtx,
  liveClassId: Id<"liveClasses">,
) {
  const reservations = await ctx.db
    .query("liveReservations")
    .withIndex("by_liveClassId_and_status", (q) =>
      q.eq("liveClassId", liveClassId).eq("status", "reserved"),
    )
    .take(LIMITS.CRON_SETTLE);

  for (const reservation of reservations) {
    const released = await releaseLiveReservationHoldIfStillReserved(
      ctx,
      reservation._id,
    );
    if (released === null) continue;
    await ctx.db.patch(reservation._id, { status: "no_show" });
  }

  if (reservations.length > 0) {
    const liveClass = await ctx.db.get(liveClassId);
    if (liveClass !== null) {
      await ctx.db.patch(liveClassId, {
        seatsTaken: Math.max(
          0,
          (liveClass.seatsTaken ?? 0) - reservations.length,
        ),
      });
    }
  }

  if (reservations.length === LIMITS.CRON_SETTLE) {
    await ctx.scheduler.runAfter(0, internal.live.settle.settle, {
      liveClassId,
    });
  }
}

export const settle = internalMutation({
  args: {
    liveClassId: v.id("liveClasses"),
  },
  handler: async (ctx, args) => {
    await settleReservationsForClass(ctx, args.liveClassId);
  },
});
