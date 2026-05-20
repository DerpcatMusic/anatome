<script lang="ts">
  import type { Id } from "$convex/_generated/dataModel";
  import type { Equipment } from "$lib/labels";
  import { equipmentLabel, durationLabel } from "$lib/labels";
  import AspectRatio from "$components/ui/AspectRatio.svelte";
  import DropdownMenu from "$components/ui/DropdownMenu.svelte";

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
    video: Video;
    actionId: string | null;
    onEdit: (video: Video) => void;
    onPublish: (videoId: Id<"videos">) => void;
    onDelete: (videoId: Id<"videos">) => void;
  }

  let {
    video,
    actionId = null,
    onEdit,
    onPublish,
    onDelete,
  }: Props = $props();

  const isPending = $derived(actionId === video._id);

  function getStatusLabel(status: string) {
    if (status === "published") return "פעיל";
    if (status === "draft") return "טיוטה";
    return "בארכיון";
  }
</script>

<article class="video-card" class:is-draft={video.status === "draft"} class:is-pending={isPending}>
  <div class="thumbnail-wrapper">
    <AspectRatio ratio={16 / 9}>
      {#if video.thumbnailUrl}
        <img src={video.thumbnailUrl} alt={video.title} loading="lazy" class="thumbnail-img" />
      {:else}
        <div class="thumbnail-placeholder">
          <span class="material-symbols-rounded placeholder-icon">movie</span>
          <span class="placeholder-duration">{durationLabel(video.durationSeconds)}</span>
        </div>
      {/if}
    </AspectRatio>
    <span class="status-badge" class:published={video.status === "published"} class:draft={video.status === "draft"}>
      {getStatusLabel(video.status)}
    </span>
  </div>

  <div class="card-body">
    <div class="card-header">
      <h3 class="video-title">{video.title}</h3>
      <DropdownMenu
        items={[
          { label: "ערוך פרטים", onclick: () => onEdit(video) },
          { label: "פרסם שיעור", onclick: () => onPublish(video._id), disabled: isPending || video.status === "published" },
          { label: "מחק וידאו", danger: true, onclick: () => onDelete(video._id), disabled: isPending },
        ]}
      >
        {#snippet trigger()}
          <button class="menu-trigger-button" type="button" aria-label="תפריט פעולות">
            <span class="material-symbols-rounded">more_vert</span>
          </button>
        {/snippet}
      </DropdownMenu>
    </div>

    <p class="video-desc">{video.description || "אין תיאור לשיעור זה."}</p>

    <div class="metadata-tags">
      <span class="meta-tag duration">{durationLabel(video.durationSeconds)}</span>
      <span class="meta-tag access" class:macroflow={video.accessKind === "macroflow"} class:microflow={video.accessKind === "microflow"}>
        {video.accessKind === "macroflow" ? "Macroflow" : "Microflow"}
      </span>
      <span class="meta-tag quality">{video.muxVideoQuality}</span>
      <span class="meta-tag resolution">{video.muxMaxResolutionTier}</span>
      {#each video.requiredEquipment as eq}
        <span class="meta-tag equipment">{equipmentLabel(eq)}</span>
      {/each}
    </div>
  </div>
</article>

<style>
  .video-card {
    border: var(--border);
    background: var(--white);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    transition: transform var(--duration-fast), box-shadow var(--duration-fast);
  }

  .video-card:hover {
    transform: translateY(-2px);
    box-shadow: 4px 4px 0 var(--ink);
  }

  .video-card.is-draft {
    border-color: color-mix(in oklch, var(--ink) 40%, transparent);
  }

  .video-card.is-pending {
    opacity: 0.6;
    pointer-events: none;
  }

  .thumbnail-wrapper {
    position: relative;
    border-bottom: var(--border);
    background: var(--surface-warm);
    overflow: hidden;
  }

  .thumbnail-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .thumbnail-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--surface-warm);
    color: var(--muted);
    gap: var(--space-1);
  }

  .placeholder-icon {
    font-size: var(--step-3);
  }

  .placeholder-duration {
    font-family: var(--font-mono);
    font-size: var(--step--1);
    font-weight: 800;
  }

  .status-badge {
    position: absolute;
    top: var(--space-2);
    right: var(--space-2);
    font-family: var(--font-mono);
    font-size: var(--step--2);
    font-weight: 800;
    padding: 2px 8px;
    border: 1px solid var(--ink);
    background: var(--white);
    color: var(--ink);
    text-transform: uppercase;
  }

  .status-badge.published {
    background: var(--sky);
  }

  .status-badge.draft {
    background: var(--surface-warm);
  }

  .card-body {
    padding: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    flex: 1;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--space-2);
  }

  .video-title {
    margin: 0;
    font-size: var(--step-1);
    font-weight: 800;
    line-height: 1.2;
    color: var(--ink);
  }

  .menu-trigger-button {
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--muted);
    padding: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color var(--duration-fast);
  }

  .menu-trigger-button:hover {
    color: var(--ink);
  }

  .video-desc {
    margin: 0;
    font-size: var(--step--1);
    line-height: 1.4;
    color: var(--muted);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .metadata-tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1);
    margin-top: auto;
  }

  .meta-tag {
    font-size: var(--step--2);
    font-weight: 700;
    padding: 2px 6px;
    border: 1px solid var(--line);
    background: var(--surface);
    color: var(--ink);
  }

  .meta-tag.duration {
    font-family: var(--font-mono);
  }

  .meta-tag.access {
    font-family: var(--font-mono);
    text-transform: uppercase;
  }

  .meta-tag.access.macroflow {
    background: color-mix(in oklch, var(--sky) 20%, var(--white));
    border-color: color-mix(in oklch, var(--sky-strong) 40%, var(--line));
  }

  .meta-tag.access.microflow {
    background: color-mix(in oklch, var(--terra-soft) 24%, var(--white));
    border-color: color-mix(in oklch, var(--terra-strong) 40%, var(--line));
  }

  .meta-tag.equipment {
    background: var(--surface-warm);
  }
</style>
