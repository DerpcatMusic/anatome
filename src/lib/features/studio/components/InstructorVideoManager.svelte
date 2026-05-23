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
  type MuxVideoQuality = "basic" | "plus" | "premium";
  type MuxMaxResolutionTier = "1080p" | "1440p" | "2160p";
  type StaticRendition = "none" | "audio-only" | "720p" | "1080p";

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

  const auth = initAuth();

  // Upload panel toggle
  let showUpload = $state(false);

  // Global actions state
  let actionId = $state<string | null>(null);
  let actionError = $state("");

  // Upload progress states
  let uploadStatus = $state<"idle" | "uploading" | "processing" | "ready" | "error">("idle");
  let uploadProgress = $state(0);
  let uploadError = $state("");
  let creatingCategory = $state(false);
  let categoryError = $state("");

  // Editing video states
  let editingVideoObj = $state<Video | null>(null);

  // Convex Subscriptions & Resources
  const client = useConvexClient();
  const listQuery = useQuery(api.video.admin.listAll, () => auth.isAuthenticated ? {} : 'skip');
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

  async function handleCreateCategory(name: string) {
    creatingCategory = true;
    categoryError = "";
    try {
      await client.mutation(api.video.categories.createCategory, { name });
      await categoriesResource.refetch();
    } catch (reason) {
      categoryError = reason instanceof Error ? reason.message : "לא הצלחנו ליצור קטגוריה.";
    } finally {
      creatingCategory = false;
    }
  }

  async function handleStartUpload(data: {
    title: string;
    description: string;
    requiredEquipment: Equipment[];
    accessKind: AccessKind;
    categoryIds: Id<"videoCategories">[];
    muxVideoQuality: MuxVideoQuality;
    muxMaxResolutionTier: MuxMaxResolutionTier;
    staticRendition: StaticRendition;
    file: File;
  }) {
    uploadStatus = "uploading";
    uploadProgress = 0;
    uploadError = "";

    try {
      const result = await client.action(api.video.uploads.requestUpload, {
        title: data.title,
        description: data.description,
        requiredEquipment: data.requiredEquipment,
        accessKind: data.accessKind,
        categoryIds: data.categoryIds,
        muxVideoQuality: data.muxVideoQuality,
        muxMaxResolutionTier: data.muxMaxResolutionTier,
        staticRendition: data.staticRendition,
      });

      if (!result?.uploadUrl) {
        uploadStatus = "error";
        uploadError = "לא הצלחנו ליצור כתובת העלאה משרת Mux.";
        return;
      }

      await uploadToMux(result.uploadUrl, data.file);
      uploadStatus = "processing";

      // Processing happens server-side via Mux webhook.
      // Show success and collapse panel after a brief moment.
      setTimeout(() => {
        if (uploadStatus === "processing") {
          uploadStatus = "ready";
          showUpload = false;
          uploadProgress = 0;
        }
      }, 1500);

    } catch (reason) {
      uploadStatus = "error";
      uploadError = reason instanceof Error ? reason.message : "העלאת קובץ הווידאו נכשלה.";
    }
  }

  function uploadToMux(url: string, file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          uploadProgress = Math.round((e.loaded / e.total) * 100);
        }
      });
      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error(`Mux returned failure code: ${xhr.status}`));
      });
      xhr.addEventListener("error", () => reject(new Error("שגיאת רשת במהלך העלאת קובץ.")));
      xhr.open("PUT", url);
      xhr.setRequestHeader("Content-Type", file.type || "video/mp4");
      xhr.send(file);
    });
  }

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
  description="העלאת שיעורים חדשים, שיוך לקטגוריות Macroflow/Microflow, וניהול תוכן מתוזמן."
>
  {#if actionError}
    <Notice tone="danger">{actionError}</Notice>
  {/if}

  {#if uploadStatus === "ready"}
    <Notice tone="success">הווידאו הועלה בהצלחה! מעבדים אותו בשרתי Mux — יופיע בספריה תוך כמה דקות.</Notice>
  {/if}

  <div class="manager-layout">
    <div class="manager-toolbar">
      <Button.Root class="hb-button {showUpload ? 'hb-button--paper' : 'hb-button--ink'}"
        type="button"
        onclick={() => { showUpload = !showUpload; }}
      >
        <span class="material-symbols-rounded">{showUpload ? "close" : "cloud_upload"}</span>
        {showUpload ? "סגירת פאנל" : "העלאת וידאו חדש"}
      </Button.Root>
    </div>

    {#if showUpload}
      <div class="upload-panel">
        <VideoUploadForm
          {categories}
          {uploadStatus}
          {uploadProgress}
          {uploadError}
          {creatingCategory}
          {categoryError}
          onCreateCategory={handleCreateCategory}
          onSubmit={handleStartUpload}
          onCancel={() => { showUpload = false; }}
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
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
