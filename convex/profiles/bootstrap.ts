import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { getOrCreateAppProfile } from "../lib/authz";

export const adminByEmail = internalMutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const configuredEmail = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
    const email = args.email.trim().toLowerCase();

    if (!configuredEmail || configuredEmail !== email) {
      throw new Error("Admin bootstrap email is not configured for this address");
    }

    const existingAdmin = await ctx.db
      .query("appProfiles")
      .withIndex("by_role", (q) => q.eq("role", "admin"))
      .first();

    if (existingAdmin !== null) throw new Error("Admin already exists");

    const users = await ctx.db.query("users").withIndex("email", (q) => q.eq("email", email)).take(1);
    const user = users[0] ?? null;
    if (user === null) throw new Error("No user found for email");

    const profile = await getOrCreateAppProfile(ctx, user._id);
    const now = Date.now();
    await ctx.db.patch(profile._id, { role: "admin", updatedAt: now });

    return profile._id;
  },
});
