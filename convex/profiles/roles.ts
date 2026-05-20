import { v } from "convex/values";
import { mutation } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { requireUserId, getOrCreateAppProfile, requireAppProfile, requireRole } from "../lib/authz";

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
  args: { email: v.string(), role: roleValidator },
  handler: async (ctx, args) => {
    const actorUserId = await requireUserId(ctx);
    const actorProfile = await requireAppProfile(ctx, actorUserId);
    requireRole(actorProfile, ["admin"]);

    const email = args.email.trim().toLowerCase();
    const user = await ctx.db.query("users").withIndex("email", (q) => q.eq("email", email)).unique();
    if (user === null) throw new Error("No user found for email");

    const profile = await getOrCreateAppProfile(ctx, user._id);
    await assertNotLastAdminDemotion(ctx, profile._id, profile.role, args.role);

    const now = Date.now();
    const rolePatch =
      args.role === "instructor"
        ? { role: args.role, instructorEnabledAt: now, updatedAt: now }
        : args.role === "customer"
          ? { role: args.role, instructorDisabledAt: now, updatedAt: now }
          : { role: args.role, updatedAt: now };

    await ctx.db.patch(profile._id, rolePatch);

    await ctx.db.insert("adminAuditEvents", {
      actorUserId,
      targetUserId: user._id,
      action: "user.role.set",
      metadata: JSON.stringify({ email, role: args.role }),
      createdAt: now,
    });

    return profile._id;
  },
});

export const toggleInstructor = mutation({
  args: { email: v.string(), enabled: v.boolean() },
  handler: async (ctx, args) => {
    const actorUserId = await requireUserId(ctx);
    const actorProfile = await requireAppProfile(ctx, actorUserId);
    requireRole(actorProfile, ["admin"]);

    const email = args.email.trim().toLowerCase();
    const targetProfile = await ctx.db
      .query("appProfiles")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (targetProfile === null) throw new Error("No app profile found for email");
    if (targetProfile.role === "admin") throw new Error("Cannot toggle instructor status for admin");

    const now = Date.now();
    const newRole = args.enabled ? "instructor" : "customer";
    const patch: Partial<Doc<"appProfiles">> = { role: newRole, updatedAt: now };
    if (args.enabled) {
      patch.instructorEnabledAt = now;
    } else {
      patch.instructorDisabledAt = now;
    }

    await ctx.db.patch(targetProfile._id, patch);

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
