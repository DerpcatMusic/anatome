import { internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { LIMITS } from "../lib/constants";
import { ensureUserWallet } from "./lib";

function bucketAvailableVod(bucket: {
  vodGranted: number;
  vodUsed: number;
}) {
  return Math.max(0, bucket.vodGranted - bucket.vodUsed);
}

function bucketAvailableLive(bucket: {
  liveGranted: number;
  liveUsed: number;
  liveReserved?: number;
}) {
  return Math.max(
    0,
    bucket.liveGranted - bucket.liveUsed - (bucket.liveReserved ?? 0),
  );
}

function bucketAvailableOneOnOne(bucket: {
  oneOnOneGranted: number;
  oneOnOneUsed: number;
  oneOnOneReserved?: number;
}) {
  return Math.max(
    0,
    bucket.oneOnOneGranted -
      bucket.oneOnOneUsed -
      (bucket.oneOnOneReserved ?? 0),
  );
}

/** One-time: move legacy creditBuckets balances into userWallets. */
export const backfillWalletsFromBuckets = internalMutation({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 100, LIMITS.SUBSCRIPTION_RENEWALS);
    const buckets = await ctx.db.query("creditBuckets").take(limit);

    let migratedUsers = 0;
    for (const bucket of buckets) {
      const wallet = await ensureUserWallet(ctx, bucket.userId);

      const addVod = bucketAvailableVod(bucket);
      const addLive = bucketAvailableLive(bucket);
      const addOneOnOne = bucketAvailableOneOnOne(bucket);
      const addLiveReserved = bucket.liveReserved ?? 0;
      const addOneOnOneReserved = bucket.oneOnOneReserved ?? 0;

      if (
        addVod > 0 ||
        addLive > 0 ||
        addOneOnOne > 0 ||
        addLiveReserved > 0 ||
        addOneOnOneReserved > 0
      ) {
        await ctx.db.patch(wallet._id, {
          vodBalance: wallet.vodBalance + addVod,
          liveBalance: wallet.liveBalance + addLive,
          liveReserved: wallet.liveReserved + addLiveReserved,
          oneOnOneBalance: wallet.oneOnOneBalance + addOneOnOne,
          oneOnOneReserved: wallet.oneOnOneReserved + addOneOnOneReserved,
          updatedAt: Date.now(),
        });
        migratedUsers += 1;
      }

      const reservations = await ctx.db
        .query("liveReservations")
        .withIndex("by_userId_and_reservedAt", (q) =>
          q.eq("userId", bucket.userId),
        )
        .take(LIMITS.LIVE_PARTICIPANTS);
      for (const row of reservations) {
        await ctx.db.patch(row._id, { walletId: wallet._id });
      }

      const requests = await ctx.db
        .query("oneOnOneRequests")
        .withIndex("by_customerUserId_and_createdAt", (q) =>
          q.eq("customerUserId", bucket.userId),
        )
        .take(LIMITS.CUSTOMER_REQUESTS);
      for (const row of requests) {
        await ctx.db.patch(row._id, { walletId: wallet._id });
      }
    }

    return {
      processedBuckets: buckets.length,
      migratedUsers,
      done: buckets.length < limit,
    };
  },
});
