import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { getOrCreateAppProfile } from "../lib/authz";
import { grantWalletCredits } from "../credits/lib";

export const setInstructorByEmail = internalMutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const users = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email))
      .take(1);
    const user = users[0] ?? null;
    if (user === null) throw new Error("No user found for email");

    const profile = await getOrCreateAppProfile(ctx, user._id);
    const now = Date.now();
    await ctx.db.patch(profile._id, {
      role: "instructor",
      instructorEnabledAt: now,
      updatedAt: now,
    });
    return profile._id;
  },
});

export const grantWalletCreditsByEmail = internalMutation({
  args: {
    email: v.string(),
    vod: v.optional(v.number()),
    live: v.optional(v.number()),
    oneOnOne: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const users = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email))
      .take(1);
    const user = users[0] ?? null;
    if (user === null) throw new Error("No user found for email");

    const walletId = await grantWalletCredits(ctx, user._id, {
      vod: args.vod,
      live: args.live,
      oneOnOne: args.oneOnOne,
    });
    return { userId: user._id, walletId };
  },
});
