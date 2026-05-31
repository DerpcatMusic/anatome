import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requireUserId, requireAppProfile, requireRole } from "../lib/authz";
import { LIMITS } from "../lib/constants";
import { categorySlugFromName, tagSlugFromName } from "../lib/videoTaxonomy";

const tagRowValidator = v.object({
  _id: v.id("videoTags"),
  categoryId: v.id("videoCategories"),
  name: v.string(),
});

export const listActiveTags = query({
  args: {},
  returns: v.array(tagRowValidator),
  handler: async (ctx) => {
    await requireUserId(ctx);
    const rows = await ctx.db
      .query("videoTags")
      .withIndex("by_isActive_and_sortOrder", (q) => q.eq("isActive", true))
      .order("asc")
      .take(LIMITS.CATEGORY_PAGE * 4);

    return rows.map((row) => ({
        _id: row._id,
        categoryId: row.categoryId,
        name: row.name,
      }));
  },
});

export const listTagsForCategories = query({
  args: { categoryIds: v.array(v.id("videoCategories")) },
  returns: v.array(tagRowValidator),
  handler: async (ctx, args) => {
    await requireUserId(ctx);
    if (args.categoryIds.length === 0) return [];

    const categorySet = new Set(args.categoryIds);
    const rows = await Promise.all(
      args.categoryIds.map((categoryId) =>
        ctx.db
          .query("videoTags")
          .withIndex("by_categoryId_and_isActive_and_sortOrder", (q) =>
            q.eq("categoryId", categoryId).eq("isActive", true),
          )
          .order("asc")
          .take(LIMITS.CATEGORY_PAGE),
      ),
    );

    return rows
      .flat()
      .filter((row) => categorySet.has(row.categoryId))
      .map((row) => ({
        _id: row._id,
        categoryId: row.categoryId,
        name: row.name,
      }));
  },
});

export const createTag = mutation({
  args: {
    categoryId: v.id("videoCategories"),
    name: v.string(),
  },
  returns: v.id("videoTags"),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const profile = await requireAppProfile(ctx, userId);
    requireRole(profile, ["instructor", "admin"]);

    const category = await ctx.db.get(args.categoryId);
    if (category === null || !category.isActive) {
      throw new Error("קטגוריה לא נמצאה");
    }

    const name = args.name.trim();
    if (name.length < 2) throw new Error("שם התגית קצר מדי");

    const now = Date.now();
    return await ctx.db.insert("videoTags", {
      categoryId: args.categoryId,
      slug: tagSlugFromName(name, now),
      name,
      sortOrder: now,
      isActive: true,
      createdByUserId: userId,
      createdAt: now,
      updatedAt: now,
    });
  },
});
