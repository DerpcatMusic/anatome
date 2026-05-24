<script lang="ts">
  import type { Id } from "$convex/_generated/dataModel";
  import type { Equipment } from "$lib/labels";
  import { equipmentLabel, durationLabel } from "$lib/labels";
  import { AspectRatio } from "bits-ui";
  import { DropdownMenu } from "bits-ui";
  import "./VideoCard.css";

  type AccessKind = "macroflow" | "microflow";

  interface Video {
    _id: Id<"videos">;
    title: string;
    description: string;
    durationSeconds?: number;
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
    <AspectRatio.Root class="hb-aspect-ratio" ratio={16 / 9}>
      {#if video.thumbnailUrl}
        <img src={video.thumbnailUrl} alt={video.title} loading="lazy" class="thumbnail-img" />
      {:else}
        <div class="thumbnail-placeholder">
          <span class="material-symbols-rounded placeholder-icon">movie</span>
          <span class="placeholder-duration">{durationLabel(video.durationSeconds)}</span>
        </div>
      {/if}
    </AspectRatio.Root>
    <span class="status-badge" class:published={video.status === "published"} class:draft={video.status === "draft"}>
      {getStatusLabel(video.status)}
    </span>
  </div>

  <div class="card-body">
    <div class="card-header">
      <h3 class="video-title">{video.title}</h3>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger class="hb-dropdown-trigger">
          <button class="menu-trigger-button" type="button" aria-label="תפריט פעולות">
            <span class="material-symbols-rounded">more_vert</span>
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content class="hb-dropdown-content">
            <DropdownMenu.Item class="hb-dropdown-item" onclick={() => onEdit(video)}>
              ערוך פרטים
            </DropdownMenu.Item>
            <DropdownMenu.Item class="hb-dropdown-item" onclick={() => onPublish(video._id)} disabled={isPending || video.status === "published"}>
              פרסם שיעור
            </DropdownMenu.Item>
            <DropdownMenu.Item class="hb-dropdown-item hb-dropdown-item--danger" onclick={() => onDelete(video._id)} disabled={isPending}>
              מחק וידאו
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
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

