import type { Id } from "$convex/_generated/dataModel";

export type VideoFilterAccess = "all" | "macroflow" | "microflow";

export type VideoTaxonomyFilterable = {
  title: string;
  description?: string;
  accessKind: "macroflow" | "microflow";
  requiredEquipment?: string[];
  categoryIds?: Id<"videoCategories">[];
  tagIds?: Id<"videoTags">[];
};

export type VideoLibraryFilters = {
  search: string;
  access: VideoFilterAccess;
  categoryId: Id<"videoCategories"> | "all";
  tagId: Id<"videoTags"> | "all";
  equipment: string | "all";
};

export function matchesVideoLibraryFilters(
  video: VideoTaxonomyFilterable,
  filters: VideoLibraryFilters,
): boolean {
  const q = filters.search.trim().toLowerCase();
  const matchesSearch =
    q.length === 0 ||
    video.title.toLowerCase().includes(q) ||
    (video.description ?? "").toLowerCase().includes(q);

  const matchesAccess = filters.access === "all" || video.accessKind === filters.access;

  const categoryIds = video.categoryIds ?? [];
  const matchesCategory =
    filters.categoryId === "all" || categoryIds.includes(filters.categoryId);

  const tagIds = video.tagIds ?? [];
  const matchesTag = filters.tagId === "all" || tagIds.includes(filters.tagId);

  const equipment = video.requiredEquipment ?? [];
  const matchesEquipment =
    filters.equipment === "all" || equipment.includes(filters.equipment);

  return matchesSearch && matchesAccess && matchesCategory && matchesTag && matchesEquipment;
}
