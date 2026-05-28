<script lang="ts">
  import type { Id } from "$convex/_generated/dataModel";
  import type { AdminVideoRow } from "$convex/contracts/video";
  import { equipmentLabel, durationLabel, videoAccessLabel } from "$lib/labels";
  import { AspectRatio, DropdownMenu } from "bits-ui";

  type Video = AdminVideoRow;

  interface Props {
    video: Video;
    actionId: string | null;
    onEdit: (video: Video) => void;
    onPublish: (videoId: Id<"videos">) => void;
    onDelete: (videoId: Id<"videos">) => void;
  }

  let { video, actionId = null, onEdit, onPublish, onDelete }: Props = $props();

  const isPending = $derived(actionId === video._id);

  function statusLabel(status: string) {
    if (status === "published") return "פעיל";
    if (status === "draft") return "טיוטה";
    return "בארכיון";
  }
</script>

<article class="video-card" class:is-draft={video.status === "draft"} class:is-pending={isPending}>
  <div class="thumbnail-wrapper">
    <AspectRatio.Root class="hb-aspect-ratio" ratio={16 / 9}>
      {#if video.thumbnailUrl}
        <img src={video.thumbnailUrl} alt="" loading="lazy" class="thumbnail-img" />
      {:else}
        <div class="thumbnail-placeholder">
          <span class="material-symbols-rounded placeholder-icon" aria-hidden="true">movie</span>
          <span class="placeholder-duration">{durationLabel(video.durationSeconds)}</span>
        </div>
      {/if}
    </AspectRatio.Root>
    <span
      class="status-badge"
      class:published={video.status === "published"}
      class:draft={video.status === "draft"}
    >
      {statusLabel(video.status)}
    </span>
  </div>

  <div class="card-body">
    <div class="card-header">
      <h3 class="video-title">{video.title}</h3>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger class="hb-dropdown-trigger">
          <button class="menu-trigger-button" type="button" aria-label="פעולות על השיעור">
            <span class="material-symbols-rounded">more_vert</span>
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content class="hb-dropdown-content">
            <DropdownMenu.Item class="hb-dropdown-item" onclick={() => onEdit(video)}>
              עריכת פרטים
            </DropdownMenu.Item>
            <DropdownMenu.Item
              class="hb-dropdown-item"
              onclick={() => onPublish(video._id)}
              disabled={isPending || video.status === "published"}
            >
              פרסום בספרייה
            </DropdownMenu.Item>
            <DropdownMenu.Item
              class="hb-dropdown-item hb-dropdown-item--danger"
              onclick={() => onDelete(video._id)}
              disabled={isPending}
            >
              העברה לארכיון
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>

    <p class="video-desc">{video.description || "אין תיאור."}</p>

    <div class="metadata-tags">
      <span class="meta-tag duration">{durationLabel(video.durationSeconds)}</span>
      <span
        class="meta-tag access"
        class:access--macro={video.accessKind === "macroflow"}
        class:access--micro={video.accessKind === "microflow"}
      >
        {videoAccessLabel(video.accessKind)}
      </span>
      {#each video.requiredEquipment.slice(0, 3) as eq}
        <span class="meta-tag equipment">{equipmentLabel(eq)}</span>
      {/each}
      {#if video.requiredEquipment.length > 3}
        <span class="meta-tag equipment">+{video.requiredEquipment.length - 3}</span>
      {/if}
    </div>
  </div>
</article>

<style>
  .thumbnail-wrapper {
    position: relative;
    background: var(--surface);
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
    gap: var(--space-1);
    color: var(--foreground-muted);
  }

  .placeholder-icon {
    font-size: var(--step-2);
  }

  .placeholder-duration {
    font-family: var(--font-mono);
    font-size: var(--step--1);
    font-weight: 800;
  }

  .card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-2);
  }

  .video-title {
    margin: 0;
    font-size: var(--step-0);
    font-weight: 800;
    line-height: 1.25;
  }

  .menu-trigger-button {
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--foreground-muted);
    padding: var(--space-1);
    display: flex;
    border-radius: 2px;
  }

  .menu-trigger-button:hover {
    color: var(--ink);
    background: var(--surface);
  }

  .video-desc {
    margin: 0;
    font-size: var(--step--1);
    line-height: 1.45;
    color: var(--foreground-muted);
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
</style>
