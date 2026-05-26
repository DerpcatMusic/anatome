import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { query } from "../_generated/server";
import { availableVodCredits, getCreditAccess } from "../credits/lib";
import { requireUserId } from "../lib/authz";
import { LIMITS } from "../lib/constants";

type PublishedVideo = Doc<"videos">;

const catalogVideoValidator = v.object({
  _id: v.id("videos"),
  title: v.string(),
  description: v.string(),
  thumbnailUrl: v.union(v.string(), v.null()),
  durationSeconds: v.union(v.number(), v.null()),
  accessKind: v.union(v.literal("macroflow"), v.literal("microflow")),
  owned: v.boolean(),
  accessible: v.boolean(),
  locked: v.boolean(),
  createdAt: v.number(),
});

const catalogCategoryValidator = v.object({
  _id: v.id("videoCategories"),
  name: v.string(),
  description: v.optional(v.string()),
});

export type CatalogVideoRow = {
  _id: Id<"videos">;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  accessKind: "macroflow" | "microflow";
  owned: boolean;
  accessible: boolean;
  locked: boolean;
  createdAt: number;
};

const DESCRIPTION_PREVIEW_MAX = 480;

function truncateDescription(description: string) {
  if (description.length <= DESCRIPTION_PREVIEW_MAX) return description;
  return `${description.slice(0, DESCRIPTION_PREVIEW_MAX).trimEnd()}…`;
}

function toCatalogRow(
  video: PublishedVideo,
  ownedById: Set<Id<"videos">>,
  hasActiveSubscription: boolean,
  guest: boolean,
): CatalogVideoRow {
  const owned = !guest && ownedById.has(video._id);
  const accessible = guest
    ? false
    : video.accessKind === "macroflow"
      ? owned
      : hasActiveSubscription;

  return {
    _id: video._id,
    title: video.title,
    description: truncateDescription(video.description),
    thumbnailUrl: video.thumbnailUrl ?? null,
    durationSeconds: video.durationSeconds ?? null,
    accessKind: video.accessKind,
    owned,
    accessible,
    locked: !accessible,
    createdAt: video.createdAt,
  };
}

async function loadPublishedCatalog(ctx: QueryCtx) {
  const categories = await ctx.db
    .query("videoCategories")
    .withIndex("by_isActive_and_sortOrder", (q) => q.eq("isActive", true))
    .order("asc")
    .take(LIMITS.CATEGORY_PAGE);

  const videos = await ctx.db
    .query("videos")
    .withIndex("by_status_and_createdAt", (q) => q.eq("status", "published"))
    .order("desc")
    .take(200);

  return { categories, videos };
}

async function buildCatalog(
  ctx: QueryCtx,
  options: { userId: Id<"users"> | null },
) {
  const guest = options.userId === null;
  const { categories, videos } = await loadPublishedCatalog(ctx);
  const videoById = new Map(videos.map((video) => [video._id, video]));

  let vodCredits = 0;
  let hasActiveSubscription = false;
  let isStaff = false;
  const ownedById = new Set<Id<"videos">>();

  if (options.userId !== null) {
    const userId = options.userId;
    const profiles = await ctx.db
      .query("appProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .take(1);
    const profile = profiles[0] ?? null;
    isStaff =
      profile !== null &&
      (profile.role === "instructor" || profile.role === "admin");

    const { subscription, wallet } = await getCreditAccess(ctx, userId);
    vodCredits = wallet === null ? 0 : availableVodCredits(wallet);
    hasActiveSubscription = subscription !== null;

    const entitlements = await ctx.db
      .query("videoEntitlements")
      .withIndex("by_userId_and_kind", (q) =>
        q.eq("userId", userId).eq("kind", "macroflow"),
      )
      .take(LIMITS.CATALOG_PAGE_SIZE);
    for (const row of entitlements) {
      ownedById.add(row.videoId);
    }
  }

  const categoryGroups = [];
  for (const category of categories) {
    const rows = await ctx.db
      .query("videoCategoryVideos")
      .withIndex("by_categoryId_and_sortOrder", (q) =>
        q.eq("categoryId", category._id),
      )
      .order("asc")
      .take(LIMITS.CATEGORY_GROUP_SIZE);

    const items = rows
      .map((row) => videoById.get(row.videoId))
      .filter(
        (video): video is PublishedVideo =>
          video !== undefined && video.accessKind === "microflow",
      )
      .map((video) =>
        toCatalogRow(video, ownedById, hasActiveSubscription, guest),
      );

    categoryGroups.push({
      category: {
        _id: category._id,
        name: category.name,
        description: category.description,
      },
      items,
    });
  }

  const macroflowVideos = videos
    .filter((video) => video.accessKind === "macroflow")
    .map((video) =>
      toCatalogRow(video, ownedById, hasActiveSubscription, guest),
    );

  return {
    isStaff,
    vodCredits,
    hasActiveSubscription,
    macroflowVideos,
    categoryGroups,
  };
}

/** Browse-safe catalog for guests and signed-in customers (no playbackId). */
export const listCatalog = query({
  args: {},
  returns: v.object({
    isStaff: v.boolean(),
    vodCredits: v.number(),
    hasActiveSubscription: v.boolean(),
    macroflowVideos: v.array(catalogVideoValidator),
    categoryGroups: v.array(
      v.object({
        category: catalogCategoryValidator,
        items: v.array(catalogVideoValidator),
      }),
    ),
  }),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    return await buildCatalog(ctx, { userId });
  },
});

/** @deprecated Prefer listCatalog — same shape, requires auth. */
export const listLibrary = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    return await buildCatalog(ctx, { userId });
  },
});
