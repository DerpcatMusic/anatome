<script lang="ts">
  import type { Id } from "$convex/_generated/dataModel";
  import { equipmentOptions } from "$lib/labels";
  import { Checkbox, ScrollArea } from "bits-ui";
  import type { VideoLibraryFilters } from "$features/videos/lib/video-filters";

  let {
    filters = $bindable(),
    categories = [],
    tags = [],
    disabled = false,
  }: {
    filters: VideoLibraryFilters;
    categories: Array<{ _id: Id<"videoCategories">; name: string }>;
    tags: Array<{ _id: Id<"videoTags">; categoryId: Id<"videoCategories">; name: string }>;
    disabled?: boolean;
  } = $props();

  const EQUIPMENT_ENTRIES = [...equipmentOptions];

  function filterVisibleTags(
    tags: Array<{ _id: Id<"videoTags">; categoryId: Id<"videoCategories">; name: string }>,
    categoryId: string,
  ) {
    if (categoryId === "all") return tags;
    return tags.filter((tag) => tag.categoryId === categoryId);
  }

  const visibleTags = $derived(filterVisibleTags(tags, filters.categoryId));
  const equipmentEntries = $derived(EQUIPMENT_ENTRIES);

  function clearSearch() {
    filters.search = "";
  }

  function selectAllCategories() {
    filters = { ...filters, categoryId: "all", tagId: "all" };
  }

  const makeCategoryHandler = (categoryId: Id<"videoCategories">) => () => {
    filters = { ...filters, categoryId, tagId: "all" };
  };

  function selectAllTags() {
    filters = { ...filters, tagId: "all" };
  }

  const makeTagHandler = (tagId: Id<"videoTags">) => () => {
    filters = { ...filters, tagId };
  };

  function selectAllEquipment() {
    filters = { ...filters, equipment: "all" };
  }

  const makeEquipmentHandler = (value: string) => () => {
    filters = { ...filters, equipment: filters.equipment === value ? "all" : value };
  };
</script>

<div class="catalog-filters" aria-label="סינון ספריית שיעורים">
  <div class="catalog-filters__search">
    <span class="material-symbols-rounded catalog-filters__search-icon" aria-hidden="true">search</span>
    <input
      type="search"
      class="catalog-filters__search-input"
      bind:value={filters.search}
      placeholder="חיפוש לפי כותרת או תיאור"
      {disabled}
      autocomplete="off"
    />
    {#if filters.search}
      <button
        type="button"
        class="catalog-filters__search-clear"
        onclick={clearSearch}
        aria-label="ניקוי חיפוש"
        {disabled}
      >
        <span class="material-symbols-rounded">close</span>
      </button>
    {/if}
  </div>

  <ScrollArea.Root class="catalog-filters__scroll catalog-filters__scroll-root" type="auto">
    <ScrollArea.Viewport class="catalog-filters__viewport">
      <div class="catalog-filters__chips">
        <div class="catalog-filters__group" role="group" aria-label="קטגוריה">
          <button
            type="button"
            class="catalog-filters__chip"
            class:is-active={filters.categoryId === "all"}
            {disabled}
            onclick={selectAllCategories}
          >
            כל הקטגוריות
          </button>
          {#each categories as category (category._id)}
            <button
              type="button"
              class="catalog-filters__chip"
              class:is-active={filters.categoryId === category._id}
              {disabled}
              onclick={makeCategoryHandler(category._id)}
            >
              {category.name}
            </button>
          {/each}
        </div>

        {#if visibleTags.length > 0}
          <div class="catalog-filters__group" role="group" aria-label="תגית">
            <button
              type="button"
              class="catalog-filters__chip catalog-filters__chip--tag"
              class:is-active={filters.tagId === "all"}
              {disabled}
              onclick={selectAllTags}
            >
              כל התגיות
            </button>
            {#each visibleTags as tag (tag._id)}
              <button
                type="button"
                class="catalog-filters__chip catalog-filters__chip--tag"
                class:is-active={filters.tagId === tag._id}
                {disabled}
                onclick={makeTagHandler(tag._id)}
              >
                {tag.name}
              </button>
            {/each}
          </div>
        {/if}

        <div class="catalog-filters__group catalog-filters__group--equipment" role="group" aria-label="ציוד">
          <button
            type="button"
            class="catalog-filters__chip"
            class:is-active={filters.equipment === "all"}
            {disabled}
            onclick={selectAllEquipment}
          >
            כל הציוד
          </button>
          {#each equipmentEntries as [value, label] (value)}
            <Checkbox.Root
              class="catalog-filters__chip catalog-filters__chip--equipment"
              checked={filters.equipment === value}
              onCheckedChange={makeEquipmentHandler(value)}
              {disabled}
            >
              {label}
            </Checkbox.Root>
          {/each}
        </div>
      </div>
    </ScrollArea.Viewport>
    <ScrollArea.Scrollbar orientation="horizontal" class="catalog-filters__scrollbar" />
  </ScrollArea.Root>
</div>

<style>
  .catalog-filters {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    background: var(--muted);
    border-radius: var(--radius-md);
  }

  .catalog-filters__search {
    position: relative;
    display: flex;
    align-items: center;
    min-height: 44px;
    background: var(--elevated);
    border-radius: var(--radius-sm);
  }

  .catalog-filters__search-icon {
    position: absolute;
    inset-inline-end: var(--space-3);
    color: var(--foreground-muted);
    pointer-events: none;
  }

  .catalog-filters__search-input {
    width: 100%;
    border: none;
    background: transparent;
    padding: var(--space-2) var(--space-10) var(--space-2) var(--space-3);
    font: inherit;
    font-size: var(--step--1);
    color: var(--ink);
  }

  .catalog-filters__search-input:focus {
    outline: none;
    box-shadow: var(--focus-ring);
    border-radius: var(--radius-sm);
  }

  .catalog-filters__search-clear {
    position: absolute;
    inset-inline-start: var(--space-2);
    border: none;
    background: transparent;
    color: var(--foreground-muted);
    cursor: pointer;
    display: flex;
    padding: var(--space-1);
    border-radius: var(--radius-sm);
  }

  :global(.catalog-filters__scroll-root) {
    width: 100%;
  }

  :global(.catalog-filters__viewport) {
    width: 100%;
  }

  :global(.catalog-filters__chips) {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    min-width: min-content;
    padding-block-end: var(--space-1);
  }

  .catalog-filters__group {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    align-items: center;
  }

  .catalog-filters__chip {
    border: none;
    background: var(--elevated);
    color: var(--foreground-muted);
    font: inherit;
    font-size: var(--step--2);
    font-weight: 800;
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-pill);
    cursor: pointer;
    white-space: nowrap;
    transition:
      background var(--duration-fast),
      color var(--duration-fast);
  }

  .catalog-filters__chip:hover:not(:disabled) {
    color: var(--ink);
    background: color-mix(in oklch, var(--elevated) 85%, var(--foreground));
  }

  .catalog-filters__chip.is-active {
    background: var(--accent-soft);
    color: var(--ink);
  }

  :global(.catalog-filters__chip--equipment) {
    min-height: 36px;
  }

  :global(.catalog-filters__scrollbar) {
    height: 6px;
  }
</style>
