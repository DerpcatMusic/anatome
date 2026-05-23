import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { LIMITS } from "../lib/constants";
import { releaseLiveCredits } from "../credits/releaseLive";
import { releaseOneOnOneCredits } from "../credits/releaseOneOnOne";

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

  const buckets = await Promise.all(
    reservations.map((r) => ctx.db.get(r.creditBucketId)),
  );

  for (let i = 0; i < reservations.length; i++) {
    const reservation = reservations[i];
    const bucket = buckets[i];
    if (bucket === null) continue;

    if (reservation.creditKind === "live") {
      await releaseLiveCredits(ctx, bucket, reservation.creditsReserved);
    } else {
      await releaseOneOnOneCredits(ctx, bucket, reservation.creditsReserved);
    }

    await ctx.db.patch(reservation._id, { status: "no_show" });
  }

  const liveClass = await ctx.db.get(liveClassId);
  if (liveClass !== null && reservations.length > 0) {
    await ctx.db.patch(liveClassId, {
      seatsTaken: Math.max(0, (liveClass.seatsTaken ?? 0) - reservations.length),
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
