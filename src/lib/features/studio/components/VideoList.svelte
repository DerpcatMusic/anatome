<script lang="ts">
  import type { Id } from "$convex/_generated/dataModel";
  import type { AdminVideoRow } from "$convex/contracts/video";
  import VideoCard from "./VideoCard.svelte";

  type AccessKind = "macroflow" | "microflow";
  type Video = AdminVideoRow;

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

  let { library = null, actionId = null, onEdit, onPublish, onDelete }: Props = $props();

  let searchQuery = $state("");
  let selectedAccessFilter = $state<"all" | AccessKind>("all");

  function filterVideos(list: Video[]) {
    const q = searchQuery.trim().toLowerCase();
    return list.filter((video) => {
      const matchesSearch =
        q.length === 0 ||
        video.title.toLowerCase().includes(q) ||
        video.description.toLowerCase().includes(q);
      const matchesAccess = selectedAccessFilter === "all" || video.accessKind === selectedAccessFilter;
      return matchesSearch && matchesAccess;
    });
  }

  const filteredPublished = $derived(library ? filterVideos(library.published) : []);
  const filteredDrafts = $derived(library ? filterVideos(library.drafts) : []);

  const totalPublishedCount = $derived(library?.published.length ?? 0);
  const totalDraftsCount = $derived(library?.drafts.length ?? 0);
  const hasVideos = $derived(totalPublishedCount + totalDraftsCount > 0);
  const hasFilteredResults = $derived(filteredPublished.length + filteredDrafts.length > 0);

  const accessFilters = [
    { id: "all" as const, label: "הכל", ariaLabel: "כל מודלי הגישה" },
    { id: "macroflow" as const, label: "בקרדיט", ariaLabel: "רכישה חד-פעמית בקרדיט" },
    { id: "microflow" as const, label: "מנוי", ariaLabel: "מנוי בלבד" },
  ];
</script>

<div class="library-toolbar">
  <div class="library-search">
    <span class="material-symbols-rounded library-search__icon" aria-hidden="true">search</span>
    <input
      type="search"
      class="library-search__input"
      bind:value={searchQuery}
      placeholder="חיפוש לפי כותרת או תיאור…"
      autocomplete="off"
    />
    {#if searchQuery}
      <button
        type="button"
        class="library-search__clear"
        onclick={() => (searchQuery = "")}
        aria-label="ניקוי חיפוש"
      >
        <span class="material-symbols-rounded">close</span>
      </button>
    {/if}
  </div>

  <div class="access-segment" role="group" aria-label="סינון לפי מודל גישה">
    {#each accessFilters as filter}
      <button
        type="button"
        class="access-segment__btn"
        class:is-active={selectedAccessFilter === filter.id}
        data-kind={filter.id === "all" ? undefined : filter.id}
        aria-label={filter.ariaLabel}
        onclick={() => (selectedAccessFilter = filter.id)}
      >
        {filter.label}
      </button>
    {/each}
  </div>
</div>

{#if !library}
  <div class="skeleton-grid" aria-busy="true" aria-label="טוען שיעורים">
    <div class="skeleton-card"></div>
    <div class="skeleton-card"></div>
    <div class="skeleton-card"></div>
  </div>
{:else if !hasVideos}
  <div class="library-empty">
    <span class="material-symbols-rounded library-empty__icon" aria-hidden="true">video_library</span>
    <h3 class="library-empty__title">עדיין אין שיעורים</h3>
    <p class="library-empty__text">
      לחצי על «העלאת שיעור» למעלה כדי להוסיף את הראשון. אחרי העיבוד הוא יופיע כאן.
    </p>
  </div>
{:else if !hasFilteredResults}
  <div class="library-empty">
    <span class="material-symbols-rounded library-empty__icon" aria-hidden="true">search_off</span>
    <h3 class="library-empty__title">אין תוצאות</h3>
    <p class="library-empty__text">נסי מילה אחרת או שנוי את סינון מודל הגישה.</p>
  </div>
{:else}
  <div class="library-sections">
    {#if filteredDrafts.length > 0}
      <section class="library-group" aria-labelledby="drafts-heading">
        <header class="library-group__head">
          <span class="material-symbols-rounded library-group__icon library-group__icon--draft" aria-hidden="true"
            >edit_document</span
          >
          <h2 id="drafts-heading" class="library-group__title">
            טיוטות ({filteredDrafts.length})
          </h2>
          {#if totalDraftsCount !== filteredDrafts.length}
            <span class="library-group__filter-note">מסונן</span>
          {/if}
        </header>
        <div class="video-grid">
          {#each filteredDrafts as video (video._id)}
            <VideoCard {video} {actionId} {onEdit} {onPublish} {onDelete} />
          {/each}
        </div>
      </section>
    {/if}

    {#if filteredPublished.length > 0}
      <section class="library-group" aria-labelledby="published-heading">
        <header class="library-group__head">
          <span
            class="material-symbols-rounded library-group__icon library-group__icon--published"
            aria-hidden="true">check_circle</span
          >
          <h2 id="published-heading" class="library-group__title">
            בספרייה ({filteredPublished.length})
          </h2>
          {#if totalPublishedCount !== filteredPublished.length}
            <span class="library-group__filter-note">מסונן</span>
          {/if}
        </header>
        <div class="video-grid">
          {#each filteredPublished as video (video._id)}
            <VideoCard {video} {actionId} {onEdit} {onPublish} {onDelete} />
          {/each}
        </div>
      </section>
    {/if}
  </div>
{/if}
