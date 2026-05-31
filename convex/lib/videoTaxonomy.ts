import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export function categorySlugFromName(name: string, now = Date.now()) {
  const ascii = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${ascii || "category"}-${now}`;
}

export function tagSlugFromName(name: string, now = Date.now()) {
  const ascii = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${ascii || "tag"}-${now}`;
}

export async function loadCategoryIdsByVideo(
  ctx: QueryCtx,
  videoIds: Id<"videos">[],
): Promise<Map<Id<"videos">, Id<"videoCategories">[]>> {
  const map = new Map<Id<"videos">, Id<"videoCategories">[]>();
  for (const videoId of videoIds) {
    map.set(videoId, []);
  }
  if (videoIds.length === 0) return map;

  await Promise.all(
    videoIds.map(async (videoId) => {
      const rows = await ctx.db
        .query("videoCategoryVideos")
        .withIndex("by_videoId", (q) => q.eq("videoId", videoId))
        .collect();
      map.set(
        videoId,
        rows.map((row) => row.categoryId),
      );
    }),
  );
  return map;
}

export async function loadTagIdsByVideo(
  ctx: QueryCtx,
  videoIds: Id<"videos">[],
): Promise<Map<Id<"videos">, Id<"videoTags">[]>> {
  const map = new Map<Id<"videos">, Id<"videoTags">[]>();
  for (const videoId of videoIds) {
    map.set(videoId, []);
  }
  if (videoIds.length === 0) return map;

  await Promise.all(
    videoIds.map(async (videoId) => {
      const rows = await ctx.db
        .query("videoTagVideos")
        .withIndex("by_videoId", (q) => q.eq("videoId", videoId))
        .collect();
      map.set(
        videoId,
        rows.map((row) => row.tagId),
      );
    }),
  );
  return map;
}

export async function replaceVideoCategories(
  ctx: MutationCtx,
  videoId: Id<"videos">,
  categoryIds: Id<"videoCategories">[],
) {
  const existing = await ctx.db
    .query("videoCategoryVideos")
    .withIndex("by_videoId", (q) => q.eq("videoId", videoId))
    .collect();
  for (const row of existing) {
    await ctx.db.delete(row._id);
  }
  const now = Date.now();
  for (let index = 0; index < categoryIds.length; index += 1) {
    await ctx.db.insert("videoCategoryVideos", {
      categoryId: categoryIds[index]!,
      videoId,
      sortOrder: now + index,
      createdAt: now,
      updatedAt: now,
    });
  }
}

export async function replaceVideoTags(
  ctx: MutationCtx,
  videoId: Id<"videos">,
  tagIds: Id<"videoTags">[],
) {
  const existing = await ctx.db
    .query("videoTagVideos")
    .withIndex("by_videoId", (q) => q.eq("videoId", videoId))
    .collect();
  for (const row of existing) {
    await ctx.db.delete(row._id);
  }
  const now = Date.now();
  for (const tagId of tagIds) {
    await ctx.db.insert("videoTagVideos", {
      tagId,
      videoId,
      createdAt: now,
      updatedAt: now,
    });
  }
}

export async function assertTagsMatchCategories(
  ctx: QueryCtx,
  categoryIds: Id<"videoCategories">[],
  tagIds: Id<"videoTags">[],
) {
  if (tagIds.length === 0) return;
  const categorySet = new Set(categoryIds);
  for (const tagId of tagIds) {
    const tag = await ctx.db.get(tagId);
    if (tag === null || !tag.isActive) {
      throw new Error("תגית לא נמצאה");
    }
    if (!categorySet.has(tag.categoryId)) {
      throw new Error("תגית חייבת להשייך לקטגוריה שנבחרה");
    }
  }
}
