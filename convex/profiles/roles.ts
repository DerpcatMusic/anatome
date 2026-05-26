import { v } from "convex/values";
import { mutation } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { requireUserId, getOrCreateAppProfile, requireAppProfile, requireRole } from "../lib/authz";
import { promoteUserToInstructor } from "../lib/promoteInstructor";

const roleValidator = v.union(v.literal("customer"), v.literal("instructor"), v.literal("admin"));

async function assertNotLastAdminDemotion(
  ctx: MutationCtx,
  targetProfileId: Id<"appProfiles">,
  currentRole: string,
  nextRole: string
) {
  if (currentRole !== "admin" || nextRole === "admin") return;
  const admins = await ctx.db
    .query("appProfiles")
    .withIndex("by_role", (q) => q.eq("role", "admin"))
    .take(2);
  const otherAdmins = admins.filter((a) => a._id !== targetProfileId);
  if (otherAdmins.length === 0) {
    throw new Error("Cannot demote the last admin");
  }
}

export const setByEmail = mutation({
  args: {
    email: v.string(),
    role: roleValidator,
    clearMemberProfile: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const actorUserId = await requireUserId(ctx);
    const actorProfile = await requireAppProfile(ctx, actorUserId);
    requireRole(actorProfile, ["admin"]);

    const email = args.email.trim().toLowerCase();
    const users = await ctx.db.query("users").withIndex("email", (q) => q.eq("email", email)).take(1);
    const user = users[0] ?? null;
    if (user === null) throw new Error("No user found for email");

    const profile = await getOrCreateAppProfile(ctx, user._id);
    await assertNotLastAdminDemotion(ctx, profile._id, profile.role, args.role);

    const now = Date.now();
    let profileId = profile._id;

    if (args.role === "instructor") {
      profileId = await promoteUserToInstructor(ctx, user._id, {
        clearMemberProfile: args.clearMemberProfile,
      });
    } else {
      const rolePatch =
        args.role === "customer"
          ? { role: args.role, instructorDisabledAt: now, updatedAt: now }
          : { role: args.role, updatedAt: now };
      await ctx.db.patch(profile._id, rolePatch);
    }

    await ctx.db.insert("adminAuditEvents", {
      actorUserId,
      targetUserId: user._id,
      action: "user.role.set",
      metadata: JSON.stringify({ email, role: args.role }),
      createdAt: now,
    });

    return profileId;
  },
});

export const toggleInstructor = mutation({
  args: { email: v.string(), enabled: v.boolean() },
  handler: async (ctx, args) => {
    const actorUserId = await requireUserId(ctx);
    const actorProfile = await requireAppProfile(ctx, actorUserId);
    requireRole(actorProfile, ["admin"]);

    const email = args.email.trim().toLowerCase();
    const targetProfiles = await ctx.db
      .query("appProfiles")
      .withIndex("by_email", (q) => q.eq("email", email))
      .take(1);
    const targetProfile = targetProfiles[0] ?? null;

    if (targetProfile === null) throw new Error("No app profile found for email");
    if (targetProfile.role === "admin") throw new Error("Cannot toggle instructor status for admin");

    const now = Date.now();

    if (args.enabled) {
      await promoteUserToInstructor(ctx, targetProfile.userId, {
        clearMemberProfile: true,
      });
    } else {
      const patch: Partial<Doc<"appProfiles">> = {
        role: "customer",
        updatedAt: now,
        instructorDisabledAt: now,
      };
      await ctx.db.patch(targetProfile._id, patch);
    }

    await ctx.db.insert("adminAuditEvents", {
      actorUserId,
      targetUserId: targetProfile.userId,
      action: "user.instructor.toggle",
      metadata: JSON.stringify({ email, enabled: args.enabled }),
      createdAt: now,
    });

    return targetProfile._id;
  },
});
