<script lang="ts">
  import type { Id } from "$convex/_generated/dataModel";
  import type { Equipment } from "$lib/labels";
  import ScrollArea from "$components/ui/ScrollArea.svelte";
  import Notice from "$components/ui/Notice.svelte";
  import VideoCard from "./VideoCard.svelte";

  type AccessKind = "macroflow" | "microflow";

  interface Video {
    _id: Id<"videos">;
    title: string;
    description: string;
    durationSeconds: number;
    accessKind: AccessKind;
    muxVideoQuality: string;
    muxMaxResolutionTier: string;
    requiredEquipment: Equipment[];
    status: "published" | "draft" | "archived";
    thumbnailUrl?: string;
  }

  interface Props {
    library: {
      published: Video[];
      drafts: Video[];
    } | null;
    actionId: string | null;
    onEdit: (video: Video) => void;
    onPublish: (videoId: Id<"videos">) => void;
    onDelete: (videoId: Id<"videos">) => void;
  }

  let {
    library = null,
    actionId = null,
    onEdit,
    onPublish,
    onDelete,
  }: Props = $props();

  let searchQuery = $state("");
  let selectedAccessFilter = $state<"all" | "macroflow" | "microflow">("all");

  // Filtering helpers
  function filterVideos(list: Video[]) {
    return list.filter((video) => {
      const matchesSearch =
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesAccess = selectedAccessFilter === "all" || video.accessKind === selectedAccessFilter;
      return matchesSearch && matchesAccess;
    });
  }

  const filteredPublished = $derived(library ? filterVideos(library.published) : []);
  const filteredDrafts = $derived(library ? filterVideos(library.drafts) : []);

  const totalPublishedCount = $derived(library?.published.length ?? 0);
  const totalDraftsCount = $derived(library?.drafts.length ?? 0);
</script>

<div class="video-library-list">
  <!-- Search & Filter Controls -->
  <div class="filter-controls-row">
    <div class="search-input-wrapper">
      <span class="material-symbols-rounded search-icon">search</span>
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="חיפוש שיעורים לפי כותרת או תיאור..."
        class="search-input"
      />
      {#if searchQuery}
        <button class="clear-search-button" onclick={() => searchQuery = ""} aria-label="נקה חיפוש">
          <span class="material-symbols-rounded">close</span>
        </button>
      {/if}
    </div>

    <div class="access-filter-chips">
      <button
        class="filter-chip"
        class:active={selectedAccessFilter === "all"}
        onclick={() => selectedAccessFilter = "all"}
      >
        הכל
      </button>
      <button
        class="filter-chip macro"
        class:active={selectedAccessFilter === "macroflow"}
        onclick={() => selectedAccessFilter = "macroflow"}
      >
        Macroflow
      </button>
      <button
        class="filter-chip micro"
        class:active={selectedAccessFilter === "microflow"}
        onclick={() => selectedAccessFilter = "microflow"}
      >
        Microflow
      </button>
    </div>
  </div>

  {#if !library}
    <div class="skeleton-grid">
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
    </div>
  {:else}
    <ScrollArea class="library-scroll-container">
      <div class="sections-stack">
        <!-- Drafts Section -->
        {#if filteredDrafts.length > 0}
          <section class="library-group">
            <div class="group-header">
              <span class="material-symbols-rounded group-icon draft">edit_document</span>
              <h2 class="group-title">שיעורים בטיוטה ({filteredDrafts.length})</h2>
              {#if totalDraftsCount !== filteredDrafts.length}
                <span class="filtered-badge">מסונן</span>
              {/if}
            </div>

            <div class="video-grid">
              {#each filteredDrafts as video (video._id)}
                <VideoCard
                  {video}
                  {actionId}
                  {onEdit}
                  {onPublish}
                  {onDelete}
                />
              {/each}
            </div>
          </section>
        {/if}

        <!-- Published Section -->
        {#if filteredPublished.length > 0}
          <section class="library-group">
            <div class="group-header">
              <span class="material-symbols-rounded group-icon published">check_circle</span>
              <h2 class="group-title">שיעורים פעילים בספרייה ({filteredPublished.length})</h2>
              {#if totalPublishedCount !== filteredPublished.length}
                <span class="filtered-badge">מסונן</span>
              {/if}
            </div>

            <div class="video-grid">
              {#each filteredPublished as video (video._id)}
                <VideoCard
                  {video}
                  {actionId}
                  {onEdit}
                  {onPublish}
                  {onDelete}
                />
              {/each}
            </div>
          </section>
        {/if}

        {#if totalPublishedCount === 0 && totalDraftsCount === 0}
          <div class="empty-state-notice">
            <span class="material-symbols-rounded empty-icon">video_library</span>
            <h3>אין עדיין שיעורים בספרייה</h3>
            <p>העלי את השיעור הראשון שלך באמצעות כרטיסיית "העלאה חדשה" למעלה.</p>
          </div>
        {:else if filteredPublished.length === 0 && filteredDrafts.length === 0}
          <div class="empty-state-notice">
            <span class="material-symbols-rounded empty-icon">search_off</span>
            <h3>לא נמצאו תוצאות</h3>
            <p>נסי לשנות את מונח החיפוש או פילטר מודל הגישה.</p>
          </div>
        {/if}
      </div>
    </ScrollArea>
  {/if}
</div>

<style>
  .video-library-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    height: 100%;
  }

  .filter-controls-row {
    display: flex;
    gap: var(--space-3);
    align-items: center;
    justify-content: space-between;
    direction: rtl;
  }

  .search-input-wrapper {
    position: relative;
    flex: 1;
    display: flex;
    align-items: center;
    border: var(--border);
    background: var(--white);
  }

  .search-icon {
    position: absolute;
    right: var(--space-3);
    color: var(--muted);
    font-size: var(--step-1);
    pointer-events: none;
  }

  .search-input {
    width: 100%;
    border: none;
    background: transparent;
    padding: var(--space-2) var(--space-10) var(--space-2) var(--space-3);
    font-size: var(--step--1);
    color: var(--ink);
  }

  .search-input:focus {
    outline: none;
  }

  .clear-search-button {
    position: absolute;
    left: var(--space-3);
    background: transparent;
    border: none;
    color: var(--muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-1);
  }

  .clear-search-button:hover {
    color: var(--ink);
  }

  .access-filter-chips {
    display: flex;
    border: var(--border);
    background: var(--white);
    padding: 2px;
  }

  .filter-chip {
    background: transparent;
    border: none;
    padding: var(--space-1) var(--space-3);
    font-size: var(--step--2);
    font-weight: 800;
    cursor: pointer;
    color: var(--muted);
    transition: background var(--duration-fast), color var(--duration-fast);
  }

  .filter-chip.active {
    background: var(--ink);
    color: var(--white);
  }

  .filter-chip.macro.active {
    background: var(--sky);
    color: var(--ink);
  }

  .filter-chip.micro.active {
    background: var(--terra);
    color: var(--white);
  }



  .sections-stack {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    direction: rtl;
  }

  .library-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .group-header {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    border-bottom: 2px solid var(--ink);
    padding-bottom: var(--space-1);
  }

  .group-icon {
    font-size: var(--step-2);
  }

  .group-icon.draft {
    color: var(--muted);
  }

  .group-icon.published {
    color: var(--sky-strong);
  }

  .group-title {
    margin: 0;
    font-size: var(--step-0);
    font-weight: 900;
    color: var(--ink);
  }

  .filtered-badge {
    font-size: var(--step--2);
    font-weight: 700;
    background: var(--surface);
    border: 1px solid var(--line);
    padding: 1px 6px;
    margin-right: auto;
  }

  .video-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--space-4);
  }

  .empty-state-notice {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: var(--space-8) var(--space-4);
    background: var(--white);
    border: var(--border);
    box-shadow: 4px 4px 0 var(--line);
    max-width: 480px;
    margin: var(--space-6) auto;
  }

  .empty-icon {
    font-size: var(--step-4);
    color: var(--muted);
    margin-bottom: var(--space-2);
  }

  .empty-state-notice h3 {
    margin: 0 0 var(--space-1);
    font-size: var(--step-1);
    font-weight: 900;
  }

  .empty-state-notice p {
    margin: 0;
    font-size: var(--step--1);
    color: var(--muted);
  }

  .skeleton-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--space-4);
  }

  .skeleton-card {
    height: 240px;
    border: var(--border);
    background: var(--white);
    animation: pulse 1.5s infinite ease-in-out;
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 0.3; }
  }

  @media (max-width: 600px) {
    .filter-controls-row {
      flex-direction: column;
      align-items: stretch;
    }
  }
</style>
