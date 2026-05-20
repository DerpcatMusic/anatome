import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { releaseLiveCredits } from "../credits/releaseLive";
import { releaseOneOnOneCredits } from "../credits/releaseOneOnOne";

export const settle = internalMutation({
  args: {
    liveClassId: v.id("liveClasses"),
  },
  handler: async (ctx, args) => {
    const reservations = await ctx.db
      .query("liveReservations")
      .withIndex("by_liveClassId_and_status", (q) =>
        q.eq("liveClassId", args.liveClassId).eq("status", "reserved"),
      )
      .take(200);

    for (const reservation of reservations) {
      const bucket = await ctx.db.get(reservation.creditBucketId);
      if (bucket === null) continue;

      if (reservation.creditKind === "live") {
        await releaseLiveCredits(ctx, bucket, reservation.creditsReserved);
      } else {
        await releaseOneOnOneCredits(ctx, bucket, reservation.creditsReserved);
      }

      await ctx.db.patch(reservation._id, { status: "no_show" });
    }

    const liveClass = await ctx.db.get(args.liveClassId);
    if (liveClass !== null && reservations.length > 0) {
      await ctx.db.patch(args.liveClassId, {
        seatsTaken: Math.max(0, (liveClass.seatsTaken ?? 0) - reservations.length),
      });
    }
  },
});
