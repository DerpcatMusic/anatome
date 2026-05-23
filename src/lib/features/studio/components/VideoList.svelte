<script lang="ts">
  import type { Id } from "$convex/_generated/dataModel";
  import type { Equipment } from "$lib/labels";
  import { ScrollArea } from "bits-ui";
  import Notice from "$components/ui/Notice.svelte";
  import VideoCard from "./VideoCard.svelte";
  import "./VideoList.css";

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
        <button type="button" class="clear-search-button" onclick={() => searchQuery = ""} aria-label="נקה חיפוש">
          <span class="material-symbols-rounded">close</span>
        </button>
      {/if}
    </div>

    <div class="access-filter-chips">
      <button
        type="button"
        class="filter-chip"
        class:active={selectedAccessFilter === "all"}
        onclick={() => selectedAccessFilter = "all"}
      >
        הכל
      </button>
      <button
        type="button"
        class="filter-chip macro"
        class:active={selectedAccessFilter === "macroflow"}
        onclick={() => selectedAccessFilter = "macroflow"}
      >
        Macroflow
      </button>
      <button
        type="button"
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
    <ScrollArea.Root class="hb-scroll-area library-scroll-container">
  <ScrollArea.Viewport class="hb-scroll-area__viewport">
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
  </ScrollArea.Viewport>
  <ScrollArea.Scrollbar class="hb-scroll-area__bar" orientation="vertical">
    <ScrollArea.Thumb class="hb-scroll-area__thumb" />
  </ScrollArea.Scrollbar>
</ScrollArea.Root>
  {/if}
</div>

