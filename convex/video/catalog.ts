import { v } from "convex/values";
import { query } from "../_generated/server";
import { requireUserId } from "../lib/authz";

export const listLibrary = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const profile = await ctx.db
      .query("appProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    const entitlements = await ctx.db
      .query("videoEntitlements")
      .withIndex("by_userId_and_kind", (q) => q.eq("userId", userId).eq("kind", "macroflow"))
      .take(500);
    const owned = new Set(entitlements.map((e) => e.videoId));
    const isStaff = profile !== null && (profile.role === "instructor" || profile.role === "admin");
    const categories = await ctx.db
      .query("videoCategories")
      .withIndex("by_isActive_and_sortOrder", (q) => q.eq("isActive", true))
      .order("asc")
      .take(100);
    const videos = await ctx.db
      .query("videos")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .order("desc")
      .take(200);
    const videoById = new Map(videos.map((video) => [video._id, video]));
    const ownedById = new Set(entitlements.map((e) => e.videoId));

    // Fetch category associations per category using index (scalable)
    const categoryGroups = [];
    for (const category of categories) {
      const rows = await ctx.db
        .query("videoCategoryVideos")
        .withIndex("by_categoryId_and_sortOrder", (q) => q.eq("categoryId", category._id))
        .order("asc")
        .take(50);
      const items = rows
        .map((row) => videoById.get(row.videoId))
        .filter((video): video is (typeof videos)[number] => Boolean(video))
        .map((video) => ({ ...video, owned: ownedById.has(video._id) }));
      categoryGroups.push({ category, items });
    }
    return {
      isStaff,
      videos: videos.map((video) => ({ ...video, owned: owned.has(video._id) })),
      categories,
      categoryGroups,
    };
  },
});
