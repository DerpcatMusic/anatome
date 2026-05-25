import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import { query } from "../_generated/server";
import { availableVodCredits, getCreditAccess } from "../credits/lib";
import { requireUserId } from "../lib/authz";
import { LIMITS } from "../lib/constants";

type PublishedVideo = Doc<"videos">;

function enrichLibraryVideo(
  video: PublishedVideo,
  ownedById: Set<Id<"videos">>,
  hasActiveSubscription: boolean,
) {
  const owned = ownedById.has(video._id);
  const accessible =
    video.accessKind === "macroflow" ? owned : hasActiveSubscription;
  return {
    ...video,
    owned,
    accessible,
    locked: !accessible,
  };
}

export const listLibrary = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const profiles = await ctx.db
      .query("appProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .take(1);
    const profile = profiles[0] ?? null;
    const { subscription, wallet } = await getCreditAccess(ctx, userId);
    const vodCredits = wallet === null ? 0 : availableVodCredits(wallet);
    const hasActiveSubscription = subscription !== null;
    const entitlements = await ctx.db
      .query("videoEntitlements")
      .withIndex("by_userId_and_kind", (q) => q.eq("userId", userId).eq("kind", "macroflow"))
      .take(LIMITS.CATALOG_PAGE_SIZE);
    const ownedById = new Set(entitlements.map((e) => e.videoId));
    const isStaff = profile !== null && (profile.role === "instructor" || profile.role === "admin");
    const categories = await ctx.db
      .query("videoCategories")
      .withIndex("by_isActive_and_sortOrder", (q) => q.eq("isActive", true))
      .order("asc")
      .take(LIMITS.CATEGORY_PAGE);
    const videos = await ctx.db
      .query("videos")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .order("desc")
      .take(200);
    const videoById = new Map(videos.map((video) => [video._id, video]));

    const categoryGroups = [];
    for (const category of categories) {
      const rows = await ctx.db
        .query("videoCategoryVideos")
        .withIndex("by_categoryId_and_sortOrder", (q) => q.eq("categoryId", category._id))
        .order("asc")
        .take(LIMITS.CATEGORY_GROUP_SIZE);
      const items = rows
        .map((row) => videoById.get(row.videoId))
        .filter(
          (video): video is PublishedVideo =>
            video !== undefined && video.accessKind === "microflow",
        )
        .map((video) => enrichLibraryVideo(video, ownedById, hasActiveSubscription));
      categoryGroups.push({ category, items });
    }

    const macroflowVideos = videos
      .filter((video) => video.accessKind === "macroflow")
      .map((video) => enrichLibraryVideo(video, ownedById, hasActiveSubscription));

    return {
      isStaff,
      vodCredits,
      hasActiveSubscription,
      macroflowVideos,
      categoryGroups,
    };
  },
});
