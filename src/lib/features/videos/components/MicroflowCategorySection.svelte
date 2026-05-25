<script lang="ts">
  import HorizontalVideoRow, { type RowVideo } from "./HorizontalVideoRow.svelte";

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
    onSelect,
  }: {
    groups?: CategoryGroup[];
    pendingId?: string | null;
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
    <p class="microflow-section__eyebrow">Microflow</p>
    <h2 id="microflow-heading" class="microflow-section__title">שיעורים לפי נושא</h2>
    <p class="microflow-section__desc">
      נפתחים עם מנוי פעיל — גללי בין הקטגוריות ובחרי שיעור.
    </p>
  </header>

  <div class="microflow-section__rows">
    {#each categoryGroups as group (group.category._id)}
      <HorizontalVideoRow
        title={group.category.name}
        subtitle={group.category.description}
        videos={group.items}
        emptyMessage="עדיין אין שיעורי Microflow בקטגוריה הזו."
        {pendingId}
        {onSelect}
      />
    {:else}
      <p class="microflow-section__empty">אין קטגוריות פעילות כרגע.</p>
    {/each}
  </div>
</section>

<style>
  .microflow-section {
    display: grid;
    gap: var(--space-5);
    padding: var(--space-5);
    border: var(--border);
    background: var(--white);
    min-width: 0;
  }

  .microflow-section__intro {
    display: grid;
    gap: var(--space-2);
    max-width: 52ch;
  }

  .microflow-section__eyebrow {
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--step--1);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--primary);
    font-weight: 800;
  }

  .microflow-section__title {
    margin: 0;
    font-size: var(--step-2);
    line-height: 1.05;
  }

  .microflow-section__desc {
    margin: 0;
    color: var(--muted);
    line-height: 1.6;
  }

  .microflow-section__rows {
    display: grid;
    gap: var(--space-6);
  }

  .microflow-section__empty {
    margin: 0;
    color: var(--muted);
  }
</style>
