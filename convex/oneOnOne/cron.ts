import { internalMutation } from "../_generated/server";
import { releaseOneOnOneCredits } from "../credits/releaseOneOnOne";

export const expireStale = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const staleRequests = await ctx.db
      .query("oneOnOneRequests")
      .withIndex("by_status_and_requestedStartsAt", (q) =>
        q.eq("status", "pending").lt("requestedStartsAt", now),
      )
      .take(100);

    for (const request of staleRequests) {
      const bucket = await ctx.db.get(request.creditBucketId);
      if (bucket !== null) {
        await releaseOneOnOneCredits(ctx, bucket, 1);
      }
      await ctx.db.patch(request._id, {
        status: "expired",
        updatedAt: now,
        decidedAt: now,
      });
    }

    return { expiredCount: staleRequests.length };
  },
});
