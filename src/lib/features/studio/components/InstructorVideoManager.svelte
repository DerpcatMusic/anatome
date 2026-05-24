<script lang="ts">
  import { api } from "$convex/_generated/api";
  import type { Id } from "$convex/_generated/dataModel";
  import type { Equipment } from "$lib/labels";
  import { Button } from "bits-ui";
  import { resource } from "runed";
  import { authQuery, initAuth } from "$lib/auth/session.svelte";
  import { useQuery, useConvexClient } from "convex-svelte";
  import PageShell from "$features/app/components/PageShell.svelte";
  import Notice from "$components/ui/Notice.svelte";

  import VideoUploadForm from "./VideoUploadForm.svelte";
  import VideoList from "./VideoList.svelte";
  import VideoEditModal from "./VideoEditModal.svelte";

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

  const auth = initAuth();

  // ── Panel state ──
  let showUpload = $state(false);

  // ── Global actions state ──
  let actionId = $state<string | null>(null);
  let actionError = $state("");

  // ── Editing state ──
  let editingVideoObj = $state<Video | null>(null);

  // ── Data ──
  const client = useConvexClient();
  const listQuery = useQuery(api.video.admin.listAll, () => (auth.isAuthenticated ? {} : "skip"));
  const library = $derived(listQuery.data ?? null);

  const categoriesResource = resource(
    () => auth.isAuthenticated,
    async (isAuthenticated) => {
      if (!isAuthenticated) return [];
      return await authQuery(api.video.categories.listCategories, {});
    },
    { initialValue: [] }
  );
  const categories = $derived(categoriesResource.current ?? []);

  // ── Actions ──
  async function handlePublishVideo(videoId: Id<"videos">) {
    actionId = videoId;
    actionError = "";
    try {
      await client.mutation(api.video.admin.updateMetadata, { videoId, status: "published" });
    } catch (reason) {
      actionError = reason instanceof Error ? reason.message : "לא הצלחנו לפרסם את השיעור.";
    } finally {
      actionId = null;
    }
  }

  async function handleDeleteVideo(videoId: Id<"videos">) {
    actionId = videoId;
    actionError = "";
    try {
      await client.mutation(api.video.admin.updateMetadata, { videoId, status: "archived" });
    } catch (reason) {
      actionError = reason instanceof Error ? reason.message : "לא הצלחנו להעביר לארכיון.";
    } finally {
      actionId = null;
    }
  }

  async function handleSaveEdit(videoId: Id<"videos">, editTitle: string, editDescription: string) {
    actionId = videoId;
    actionError = "";
    try {
      await client.mutation(api.video.admin.updateMetadata, {
        videoId,
        title: editTitle,
        description: editDescription,
      });
      editingVideoObj = null;
    } catch (reason) {
      actionError = reason instanceof Error ? reason.message : "לא הצלחנו לשמור שינויים.";
      throw reason;
    } finally {
      actionId = null;
    }
  }
</script>

<PageShell
  title="ספריית שיעורי וידאו"
  description="העלאת שיעורים חדשים וניהול תוכן מתוזמן."
>
  {#if actionError}
    <Notice tone="danger">{actionError}</Notice>
  {/if}

  <div class="manager-layout">
    <div class="manager-toolbar">
      <Button.Root
        class="hb-button {showUpload ? 'hb-button--paper' : 'hb-button--ink'}"
        type="button"
        onclick={() => {
          showUpload = !showUpload;
        }}
      >
        <span class="material-symbols-rounded">{showUpload ? "close" : "cloud_upload"}</span>
        {showUpload ? "סגירת פאנל" : "העלאת וידאו חדש"}
      </Button.Root>
    </div>

    {#if showUpload}
      <div class="upload-panel">
        <VideoUploadForm
          {categories}
          onComplete={() => {
            showUpload = false;
          }}
          onCancel={() => {
            showUpload = false;
          }}
        />
      </div>
    {/if}

    <VideoList
      {library}
      {actionId}
      onEdit={(video) => (editingVideoObj = video)}
      onPublish={handlePublishVideo}
      onDelete={handleDeleteVideo}
    />
  </div>
</PageShell>

{#if editingVideoObj}
  <VideoEditModal
    video={editingVideoObj}
    {actionId}
    onClose={() => (editingVideoObj = null)}
    onSave={handleSaveEdit}
  />
{/if}

<style>
  .manager-layout {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
    direction: rtl;
  }

  .manager-toolbar {
    display: flex;
    justify-content: flex-start;
  }

  .upload-panel {
    border: var(--border);
    background: var(--white);
    padding: var(--space-5);
    animation: slideDown 0.2s var(--ease-out);
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
