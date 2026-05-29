import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { grantWalletCredits } from "../credits/lib";
import { getOrCreateAppProfile } from "../lib/authz";
import { promoteUserToInstructor } from "../lib/promoteInstructor";

const staffRoleValidator = v.union(v.literal("instructor"), v.literal("admin"));

/** Ops: promote by email on prod via `convex run --prod ops/support:setStaffRoleByEmail`. */
export const setStaffRoleByEmail = internalMutation({
  args: {
    email: v.string(),
    role: staffRoleValidator,
    clearMemberProfile: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const users = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email))
      .take(1);
    const user = users[0] ?? null;
    if (user === null) throw new Error("No user found for email");

    if (args.role === "instructor") {
      return await promoteUserToInstructor(ctx, user._id, {
        clearMemberProfile: args.clearMemberProfile,
      });
    }

    const profile = await getOrCreateAppProfile(ctx, user._id);
    const now = Date.now();
    await ctx.db.patch(profile._id, {
      role: "admin",
      instructorDisabledAt: undefined,
      updatedAt: now,
    });
    return profile._id;
  },
});

export const setInstructorByEmail = internalMutation({
  args: {
    email: v.string(),
    clearMemberProfile: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const users = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email))
      .take(1);
    const user = users[0] ?? null;
    if (user === null) throw new Error("No user found for email");

    return await promoteUserToInstructor(ctx, user._id, {
      clearMemberProfile: args.clearMemberProfile,
    });
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
