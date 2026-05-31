<script lang="ts">
  import type { Id } from "$convex/_generated/dataModel";
  import { equipmentOptions } from "$lib/labels";
  import { ScrollArea } from "bits-ui";
  import type { VideoLibraryFilters } from "$features/videos/lib/video-filters";

  let {
    filters = $bindable(),
    categories = [],
    tags = [],
  }: {
    filters: VideoLibraryFilters;
    categories: Array<{ _id: Id<"videoCategories">; name: string }>;
    tags: Array<{ _id: Id<"videoTags">; categoryId: Id<"videoCategories">; name: string }>;
  } = $props();

  function filterVisibleTags(
    tags: Array<{ _id: Id<"videoTags">; categoryId: Id<"videoCategories">; name: string }>,
    categoryId: string,
  ) {
    if (categoryId === "all") return tags;
    return tags.filter((tag) => tag.categoryId === categoryId);
  }

  const visibleTags = $derived(filterVisibleTags(tags, filters.categoryId));

  function handleSetCategoryAll() {
    filters = { ...filters, categoryId: "all", tagId: "all" };
  }

  const handleSetCategory = (categoryId: Id<"videoCategories">) => () => {
    filters = { ...filters, categoryId, tagId: "all" };
  };

  function handleSetTagAll() {
    filters = { ...filters, tagId: "all" };
  }

  const handleSetTag = (tagId: Id<"videoTags">) => () => {
    filters = { ...filters, tagId };
  };

  function handleSetEquipmentAll() {
    filters = { ...filters, equipment: "all" };
  }

  const handleSetEquipment = (value: string) => () => {
    filters = { ...filters, equipment: filters.equipment === value ? "all" : value };
  };
</script>

<div class="ivm-filters" aria-label="סינון ספריית שיעורים">
  <ScrollArea.Root class="ivm-filters__scroll" type="auto">
    <ScrollArea.Viewport class="ivm-filters__viewport">
      <div class="ivm-filters__content">
        <div class="ivm-filters__group" role="group" aria-label="קטגוריה">
          <button
            type="button"
            class="ivm-filters__chip"
            class:is-active={filters.categoryId === "all"}
            onclick={handleSetCategoryAll}
          >
            כל הקטגוריות
          </button>
          {#each categories as category (category._id)}
            <button
              type="button"
              class="ivm-filters__chip"
              class:is-active={filters.categoryId === category._id}
              onclick={handleSetCategory(category._id)}
            >
              {category.name}
            </button>
          {/each}
        </div>

        {#if visibleTags.length > 0}
          <div class="ivm-filters__group" role="group" aria-label="תגית">
            <button
              type="button"
              class="ivm-filters__chip"
              class:is-active={filters.tagId === "all"}
              onclick={handleSetTagAll}
            >
              כל התגיות
            </button>
            {#each visibleTags as tag (tag._id)}
              <button
                type="button"
                class="ivm-filters__chip"
                class:is-active={filters.tagId === tag._id}
                onclick={handleSetTag(tag._id)}
              >
                {tag.name}
              </button>
            {/each}
          </div>
        {/if}

        <div class="ivm-filters__group" role="group" aria-label="ציוד">
          <button
            type="button"
            class="ivm-filters__chip"
            class:is-active={filters.equipment === "all"}
            onclick={handleSetEquipmentAll}
          >
            כל הציוד
          </button>
          {#each [...equipmentOptions] as [value, label] (value)}
            <button
              type="button"
              class="ivm-filters__chip"
              class:is-active={filters.equipment === value}
              onclick={handleSetEquipment(value)}
            >
              {label}
            </button>
          {/each}
        </div>
      </div>
    </ScrollArea.Viewport>
    <ScrollArea.Scrollbar orientation="horizontal" class="ivm-filters__scrollbar" />
  </ScrollArea.Root>
</div>
