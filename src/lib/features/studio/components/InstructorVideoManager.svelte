<script lang="ts">
  import { api } from "$convex/_generated/api";
  import type { Id } from "$convex/_generated/dataModel";
  import type { Equipment } from "$lib/labels";
  import Tabs from "$components/ui/Tabs.svelte";
  import { Tabs as BitsTabs } from "bits-ui";
  import { resource } from "runed";
  import { authQuery, initAuth } from "$lib/auth/session.svelte";
  import { useQuery, useConvexClient } from "convex-svelte";
  import PageShell from "$features/app/components/PageShell.svelte";
  import Notice from "$components/ui/Notice.svelte";

  // Subcomponents imports
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
  let tab = $state<"library" | "upload">("library");

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

  // Category creation mutation
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

  // File uploading action orchestration
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
      // Step 1: Request upload token and Mux url from Convex
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

      // Step 2: Upload direct file payload to Mux bucket
      await uploadToMux(result.uploadUrl, data.file);
      uploadStatus = "processing";

      // Step 3: Fast polling simulated success before background webhook finishes
      setTimeout(() => {
        if (uploadStatus === "processing") {
          uploadStatus = "ready";
          tab = "library";
          uploadProgress = 0;
        }
      }, 2500);

    } catch (reason) {
      uploadStatus = "error";
      uploadError = reason instanceof Error ? reason.message : "העלאת קובץ הווידאו נכשלה.";
    }
  }

  // Upload raw stream tracking
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

  // Publishing existing draft video
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

  // Archiving/deleting video record
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

  // Save metadata modifications inside modal dialog
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

  <Tabs bind:value={tab} items={[{ value: "library", label: "ספריית שיעורים" }, { value: "upload", label: "העלאת וידאו חדש" }]} ariaLabel="ניהול סרטוני וידאו">
    <!-- Tab 1: Video Library Grid -->
    <BitsTabs.Content value="library">
      <div class="library-tab-content">
        <VideoList
          {library}
          {actionId}
          onEdit={(video) => (editingVideoObj = video)}
          onPublish={handlePublishVideo}
          onDelete={handleDeleteVideo}
        />
      </div>
    </BitsTabs.Content>

    <!-- Tab 2: Upload Panel Form -->
    <BitsTabs.Content value="upload">
      <div class="upload-tab-content">
        <VideoUploadForm
          {categories}
          {uploadStatus}
          {uploadProgress}
          {uploadError}
          {creatingCategory}
          {categoryError}
          onCreateCategory={handleCreateCategory}
          onSubmit={handleStartUpload}
        />
      </div>
    </BitsTabs.Content>
  </Tabs>
</PageShell>

<!-- Edit Video Metadata Popup Dialog Modal -->
{#if editingVideoObj}
  <VideoEditModal
    video={editingVideoObj}
    {actionId}
    onClose={() => (editingVideoObj = null)}
    onSave={handleSaveEdit}
  />
{/if}

<style>
  .library-tab-content,
  .upload-tab-content {
    margin-top: var(--space-5);
    direction: rtl;
  }
</style>
