import { internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { LIMITS } from "../lib/constants";
import { releaseOneOnOneCredits } from "../credits/lib";
import type { Doc } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

async function expireRequest(
  ctx: MutationCtx,
  request: Doc<"oneOnOneRequests">,
  now: number,
) {
  if (request.status !== "pending") return "inactive" as const;

  await releaseOneOnOneCredits(ctx, request.walletId, 1);
  await ctx.db.patch(request._id, {
    status: "expired",
    updatedAt: now,
    decidedAt: now,
  });
  return "expired" as const;
}

export const expireStale = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const staleRequests = await ctx.db
      .query("oneOnOneRequests")
      .withIndex("by_status_and_requestedStartsAt", (q) =>
        q.eq("status", "pending").lt("requestedStartsAt", now),
      )
      .take(LIMITS.CRON_ONE_ON_ONE);

    for (const request of staleRequests) {
      await expireRequest(ctx, request, now);
    }

    return { expiredCount: staleRequests.length };
  },
});

export const expireOne = internalMutation({
  args: {
    requestId: v.id("oneOnOneRequests"),
    expectedRequestedStartsAt: v.number(),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (request === null) return { status: "missing" as const };
    if (request.requestedStartsAt !== args.expectedRequestedStartsAt) {
      return { status: "stale" as const };
    }
    const status = await expireRequest(ctx, request, Date.now());
    return { status };
  },
});
