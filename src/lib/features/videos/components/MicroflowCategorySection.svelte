<script lang="ts">
  import HorizontalVideoRow, { type RowVideo } from "./HorizontalVideoRow.svelte";
  import "../videos-feature.css";

  export type CategoryGroup = {
    category: {
      _id: string;
      name: string;
      description?: string;
    };
    items: RowVideo[];
  };

  let {
    groups = [],
    pendingId = null,
    eyebrow = "",
    title = "תרגולים ממוקדים",
    description = "",
    categoryEmptyMessage = "אין שיעורים בקטגוריה.",
    sectionsEmptyMessage = "אין קטגוריות.",
    statusLabelFor,
    useLockGlyph = false,
    onSelect,
  }: {
    groups?: CategoryGroup[];
    pendingId?: string | null;
    eyebrow?: string;
    title?: string;
    description?: string;
    categoryEmptyMessage?: string;
    sectionsEmptyMessage?: string;
    statusLabelFor?: (video: RowVideo) => string;
    useLockGlyph?: boolean;
    onSelect: (video: RowVideo) => void;
  } = $props();

  const categoryGroups = $derived(
    (Array.isArray(groups) ? groups : []).map((group) => ({
      ...group,
      items: Array.isArray(group.items) ? group.items : [],
    })),
  );
</script>

<section class="microflow-section" aria-labelledby="microflow-heading">
  <header class="microflow-section__intro">
    {#if eyebrow}
      <p class="videos-eyebrow videos-eyebrow--video">{eyebrow}</p>
    {/if}
    <h2 id="microflow-heading" class="microflow-section__title">{title}</h2>
    {#if description}
      <p class="microflow-section__desc">{description}</p>
    {/if}
  </header>

  <div class="microflow-section__rows">
    {#each categoryGroups as group (group.category._id)}
      <HorizontalVideoRow
        title={group.category.name}
        subtitle={group.category.description}
        videos={group.items}
        emptyMessage={categoryEmptyMessage}
        {pendingId}
        {statusLabelFor}
        {useLockGlyph}
        {onSelect}
      />
    {:else}
      <p class="microflow-section__empty">{sectionsEmptyMessage}</p>
    {/each}
  </div>
</section>

<style>
  .microflow-section {
    display: grid;
    gap: var(--space-5);
    padding: var(--space-5);
    border: var(--border);
    background: var(--elevated);
    min-width: 0;
  }

  .microflow-section__intro {
    display: grid;
    gap: var(--space-2);
    max-width: 52ch;
  }

  .microflow-section__title {
    margin: 0;
    font-size: var(--step-2);
    line-height: 1.05;
  }

  .microflow-section__desc {
    margin: 0;
    color: var(--foreground-muted);
    line-height: 1.6;
  }

  .microflow-section__rows {
    display: grid;
    gap: var(--space-6);
  }

  .microflow-section__empty {
    margin: 0;
    color: var(--foreground-muted);
  }
</style>
