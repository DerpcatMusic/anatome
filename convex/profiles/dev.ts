import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { getOrCreateAppProfile } from "../lib/authz";
import { promoteUserToInstructor } from "../lib/promoteInstructor";

const roleValidator = v.union(v.literal("customer"), v.literal("instructor"), v.literal("admin"));

/**
 * Ops-only dev/staging role promotion — requires `DEV_SECRET`. Run from Convex Dashboard
 * or `npx convex run profiles/dev:promote`. Blocked on production-like deployments unless
 * `ALLOW_DEV_PROMOTE=true` is set explicitly for a controlled operation.
 */
function assertDevPromoteAllowed() {
  if (process.env.ALLOW_DEV_PROMOTE === "true") return;

  const deployment = process.env.CONVEX_DEPLOYMENT?.trim() ?? "";
  if (deployment.length === 0) return;

  const looksNonDev = !/(^dev$|dev[-_]|[-_]dev|staging|preview|local|sandbox)/i.test(deployment);
  if (looksNonDev) {
    throw new Error(
      "internal profiles/dev.promote is disabled on this deployment. Set ALLOW_DEV_PROMOTE=true only for a controlled operation.",
    );
  }
}

export const promote = internalMutation({
  args: {
    email: v.string(),
    role: roleValidator,
    secret: v.string(),
    clearMemberProfile: v.optional(v.boolean()),
  },
  returns: v.id("appProfiles"),
  handler: async (ctx, args) => {
    assertDevPromoteAllowed();

    const expected = process.env.DEV_SECRET?.trim();
    if (!expected || args.secret.trim() !== expected) {
      throw new Error("Invalid secret");
    }

    const email = args.email.trim().toLowerCase();
    const users = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email))
      .take(1);
    const user = users[0] ?? null;
    if (user === null) throw new Error("No user found for email");

    if (args.role === "instructor") {
      const profileId = await promoteUserToInstructor(ctx, user._id, {
        clearMemberProfile: args.clearMemberProfile,
      });
      return profileId;
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
