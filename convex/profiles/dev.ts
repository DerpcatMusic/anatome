import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getOrCreateAppProfile } from "../lib/authz";
import { promoteUserToInstructor } from "../lib/promoteInstructor";

const roleValidator = v.union(v.literal("customer"), v.literal("instructor"), v.literal("admin"));

export const promote = mutation({
  args: {
    email: v.string(),
    role: roleValidator,
    secret: v.string(),
    clearMemberProfile: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const expected = process.env.DEV_SECRET?.trim();
    if (!expected || args.secret.trim() !== expected) throw new Error("Invalid secret");

    const email = args.email.trim().toLowerCase();
    const users = await ctx.db.query("users").withIndex("email", (q) => q.eq("email", email)).take(1);
    const user = users[0] ?? null;
    if (user === null) throw new Error("No user found for email");

    if (args.role === "instructor") {
      return await promoteUserToInstructor(ctx, user._id, {
        clearMemberProfile: args.clearMemberProfile,
      });
    }

    const profile = await getOrCreateAppProfile(ctx, user._id);
    const now = Date.now();
    const rolePatch =
      args.role === "customer"
        ? { role: args.role, instructorDisabledAt: now, updatedAt: now }
        : { role: args.role, updatedAt: now };

    await ctx.db.patch(profile._id, rolePatch);
    return profile._id;
  },
});
