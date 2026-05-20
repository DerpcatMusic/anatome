import { v } from "convex/values";
import { mutation, internalMutation } from "./_generated/server";
import { api } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { requireUserId, getOrCreateAppProfile, requireAppProfile, requireRole } from "./lib/authz";

const roleValidator = v.union(
  v.literal("customer"),
  v.literal("instructor"),
  v.literal("admin")
);

export const viewer = mutation({
  args: {},
  handler: async (ctx): Promise<Doc<"appProfiles"> | null> => {
    const userId = await requireUserId(ctx);
    return await ctx.db
      .query("appProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
  },
});

export const updateInstructorProfile = mutation({
  args: {
    displayName: v.optional(v.string()),
    credentials: v.optional(v.string()),
    certificateDocument: v.optional(v.string()),
    insuranceDocument: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const profile = await requireAppProfile(ctx, userId);
    requireRole(profile, ["instructor", "admin"]);

    const patch: Partial<Doc<"appProfiles">> = { updatedAt: Date.now() };
    if (args.displayName !== undefined) patch.displayName = args.displayName;
    if (args.credentials !== undefined) patch.credentials = args.credentials;
    if (args.certificateDocument !== undefined) patch.certificateDocument = args.certificateDocument;
    if (args.insuranceDocument !== undefined) patch.insuranceDocument = args.insuranceDocument;

    await ctx.db.patch(profile._id, patch);
    return profile._id;
  },
});

export const toggleInstructorByEmail = mutation({
  args: {
    email: v.string(),
    enabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const actorUserId = await requireUserId(ctx);
    const actorProfile = await requireAppProfile(ctx, actorUserId);
    requireRole(actorProfile, ["admin"]);

    const email = args.email.trim().toLowerCase();
    const targetProfile = await ctx.db
      .query("appProfiles")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (targetProfile === null) {
      throw new Error("No app profile found for email");
    }

    if (targetProfile.role === "admin") {
      throw new Error("Cannot toggle instructor status for admin");
    }

    const now = Date.now();
    const newRole = args.enabled ? "instructor" : "customer";
    const patch: Partial<Doc<"appProfiles">> = {
      role: newRole,
      updatedAt: now,
    };
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

export const setRoleByEmail = mutation({
  args: {
    email: v.string(),
    role: roleValidator,
  },
  handler: async (ctx, args) => {
    const actorUserId = await requireUserId(ctx);
    const actorProfile = await requireAppProfile(ctx, actorUserId);
    requireRole(actorProfile, ["admin"]);

    const email = args.email.trim().toLowerCase();
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email))
      .unique();

    if (user === null) {
      throw new Error("No user found for email");
    }

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

export const bootstrapAdminByEmail = internalMutation({
  args: {
    email: v.string(),
  },
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

    if (existingAdmin !== null) {
      throw new Error("Admin already exists");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email))
      .unique();

    if (user === null) {
      throw new Error("No user found for email");
    }

    const profile = await getOrCreateAppProfile(ctx, user._id);
    const now = Date.now();
    await ctx.db.patch(profile._id, {
      role: "admin",
      updatedAt: now,
    });

    return profile._id;
  },
});

// ─── Dev-only: promote any user without admin privileges ─────
// Guarded by DEV_SECRET env var. Never expose in production UI.
export const devPromote = mutation({
  args: {
    email: v.string(),
    role: roleValidator,
    secret: v.string(),
  },
  handler: async (ctx, args) => {
    const expected = process.env.DEV_SECRET?.trim();
    if (!expected || args.secret.trim() !== expected) {
      throw new Error("Invalid secret");
    }

    const email = args.email.trim().toLowerCase();
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email))
      .unique();

    if (user === null) {
      throw new Error("No user found for email");
    }

    const profile = await getOrCreateAppProfile(ctx, user._id);
    const now = Date.now();
    const rolePatch =
      args.role === "instructor"
        ? { role: args.role, instructorEnabledAt: now, updatedAt: now }
        : args.role === "customer"
          ? { role: args.role, instructorDisabledAt: now, updatedAt: now }
          : { role: args.role, updatedAt: now };

    await ctx.db.patch(profile._id, rolePatch);
    return profile._id;
  },
});
