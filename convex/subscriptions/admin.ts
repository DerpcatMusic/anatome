import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { requireAppProfile, requireRole, requireUserId } from "../lib/authz";
import { getActiveSubscription, grantSubscriptionPeriodCredits, MONTH_MS } from "./lib";
import { ensureUserWallet } from "../credits/lib";
import { scheduleSubscriptionRenewal } from "./schedule";

export const upsertPlan = mutation({
  args: {
    slug: v.string(),
    nameHe: v.string(),
    monthlyPriceIls: v.number(),
    platformFeeIls: v.optional(v.number()),
    vodCreditValueIls: v.optional(v.number()),
    liveCreditValueIls: v.optional(v.number()),
    oneOnOneCreditValueIls: v.optional(v.number()),
    vodCreditsPerMonth: v.number(),
    liveCreditsPerMonth: v.number(),
    oneOnOneCreditsPerMonth: v.number(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const actorId = await requireUserId(ctx);
    const actor = await requireAppProfile(ctx, actorId);
    requireRole(actor, ["admin"]);

    const slug = args.slug.trim().toLowerCase();
    if (!slug) throw new Error("Plan slug is required");

    const existingRows = await ctx.db
      .query("plans")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .take(1);
    const existing = existingRows[0] ?? null;

    const payload = {
      slug,
      nameHe: args.nameHe.trim(),
      monthlyPriceIls: Math.max(0, args.monthlyPriceIls),
      platformFeeIls: Math.max(0, args.platformFeeIls ?? 40),
      vodCreditValueIls: Math.max(0, args.vodCreditValueIls ?? 10),
      liveCreditValueIls: Math.max(0, args.liveCreditValueIls ?? 40),
      oneOnOneCreditValueIls: Math.max(0, args.oneOnOneCreditValueIls ?? 140),
      vodCreditsPerMonth: Math.max(0, Math.floor(args.vodCreditsPerMonth)),
      liveCreditsPerMonth: Math.max(0, Math.floor(args.liveCreditsPerMonth)),
      oneOnOneCreditsPerMonth: Math.max(0, Math.floor(args.oneOnOneCreditsPerMonth)),
      isActive: args.isActive,
    };

    if (existing !== null) {
      await ctx.db.patch(existing._id, payload);
      return existing._id;
    }

    return await ctx.db.insert("plans", payload);
  },
});

export const grantManualByEmail = mutation({
  args: {
    email: v.string(),
    planSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const actorId = await requireUserId(ctx);
    const actor = await requireAppProfile(ctx, actorId);
    requireRole(actor, ["admin"]);

    const email = args.email.trim().toLowerCase();
    const users = await ctx.db.query("users").withIndex("email", (q) => q.eq("email", email)).take(1);
    const user = users[0] ?? null;
    if (user === null) throw new Error("No user found for email");

    const plans = await ctx.db
      .query("plans")
      .withIndex("by_slug", (q) => q.eq("slug", args.planSlug.trim().toLowerCase()))
      .take(10);
    const plan = plans.find((row) => row.isActive) ?? null;
    if (plan === null || !plan.isActive) throw new Error("Plan is not available");

    const active = await getActiveSubscription(ctx, user._id);
    if (active !== null) {
      const wallet = await ensureUserWallet(ctx, user._id);
      return { subscriptionId: active._id, walletId: wallet._id };
    }

    const now = Date.now();
    const subscriptionId = await ctx.db.insert("userSubscriptions", {
      userId: user._id,
      planId: plan._id,
      status: "active",
      currentPeriodStart: now,
      currentPeriodEnd: now + MONTH_MS,
      cancelAtPeriodEnd: false,
      provider: "manual",
      createdAt: now,
      updatedAt: now,
    });
    const renewalScheduledFunctionId = await scheduleSubscriptionRenewal(
      ctx,
      subscriptionId,
      now + MONTH_MS,
    );
    await ctx.db.patch(subscriptionId, { renewalScheduledFunctionId });

    const subscription = await ctx.db.get(subscriptionId);
    if (subscription === null) throw new Error("Subscription creation failed");
    const walletId = await grantSubscriptionPeriodCredits(ctx, subscription, plan);

    return { subscriptionId, walletId };
  },
});
