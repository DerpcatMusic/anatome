import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import {
  getOrCreateAppProfile,
  requireAppProfile,
  requireRole,
  requireUserId,
} from "./lib/authz";

const roleValidator = v.union(v.literal("customer"), v.literal("instructor"), v.literal("admin"));

declare const process: {
  env: {
    ADMIN_BOOTSTRAP_EMAIL?: string;
  };
};

export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    return await ctx.db
      .query("appProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
  },
});

export const updateInstructorProfile = mutation({
  args: {
    displayName: v.string(),
    credentials: v.optional(v.string()),
    certificateDocument: v.optional(v.string()),
    insuranceDocument: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const profile = await requireAppProfile(ctx, userId);
    requireRole(profile, ["instructor", "admin"]);

    const now = Date.now();
    const patch: Record<string, unknown> = {
      displayName: args.displayName.trim(),
      updatedAt: now,
    };
    if (args.credentials !== undefined) {
      patch.credentials = args.credentials.trim();
    }
    if (args.certificateDocument !== undefined) {
      patch.certificateDocument = args.certificateDocument;
    }
    if (args.insuranceDocument !== undefined) {
      patch.insuranceDocument = args.insuranceDocument;
    }

    await ctx.db.patch(profile._id, patch);
    return profile._id;
  },
});

export const ensureViewerProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    return await getOrCreateAppProfile(ctx, userId);
  },
});

async function assertNotLastAdminDemotion(ctx: MutationCtx, targetProfileRole: string, nextRole: string) {
  if (targetProfileRole !== "admin" || nextRole === "admin") return;

  const admins = await ctx.db
    .query("appProfiles")
    .withIndex("by_role", (q) => q.eq("role", "admin"))
    .take(2);
  if (admins.length < 2) {
    throw new Error("Cannot remove the last admin");
  }
}

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
      throw new Error("Admin role cannot be changed by instructor toggle");
    }

    const now = Date.now();
    const rolePatch = args.enabled
      ? {
          role: "instructor" as const,
          instructorEnabledAt: now,
          updatedAt: now,
        }
      : {
          role: "customer" as const,
          instructorDisabledAt: now,
          updatedAt: now,
        };

    await ctx.db.patch(targetProfile._id, rolePatch);

    await ctx.db.insert("adminAuditEvents", {
      actorUserId,
      targetUserId: targetProfile.userId,
      action: args.enabled ? "instructor.enabled" : "instructor.disabled",
      metadata: JSON.stringify({ email }),
      createdAt: now,
    });

    return targetProfile._id;
  },
});

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
    await assertNotLastAdminDemotion(ctx, profile.role, args.role);

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

    await ctx.db.insert("adminAuditEvents", {
      actorUserId: user._id,
      targetUserId: user._id,
      action: "admin.bootstrap.internal",
      metadata: JSON.stringify({ email }),
      createdAt: now,
    });

    return profile._id;
  },
});
