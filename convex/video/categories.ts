import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requireUserId, requireAppProfile, requireRole } from "../lib/authz";

export const listCategories = query({
  args: {},
  handler: async (ctx) => {
    await requireUserId(ctx);
    return await ctx.db
      .query("videoCategories")
      .withIndex("by_isActive_and_sortOrder", (q) => q.eq("isActive", true))
      .order("asc")
      .take(100);
  },
});

export const createCategory = mutation({
  args: { name: v.string(), description: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const profile = await requireAppProfile(ctx, userId);
    requireRole(profile, ["instructor", "admin"]);

    const name = args.name.trim();
    if (name.length < 2) throw new Error("Category name is too short");
    const now = Date.now();
    return await ctx.db.insert("videoCategories", {
      slug: `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "category"}-${now}`,
      name,
      description: args.description?.trim(),
      sortOrder: now,
      isActive: true,
      createdByUserId: userId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const attachVideoToCategory = mutation({
  args: { categoryId: v.id("videoCategories"), videoId: v.id("videos"), sortOrder: v.number() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const profile = await requireAppProfile(ctx, userId);
    requireRole(profile, ["instructor", "admin"]);
    return await ctx.db.insert("videoCategoryVideos", { ...args, createdAt: Date.now(), updatedAt: Date.now() });
  },
});
