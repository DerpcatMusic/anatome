<script lang="ts">
  import { api } from "$convex/_generated/api";
  import type { Id } from "$convex/_generated/dataModel";
  import type { AdminVideoRow } from "$convex/contracts/video";
  import { Button } from "bits-ui";
  import { resource } from "runed";
  import { authQuery, initAuth, canRunAuthenticatedQuery } from "$lib/auth/session.svelte";
  import { useQuery, useConvexClient } from "convex-svelte";
  import PageShell from "$features/app/components/PageShell.svelte";
  import Notice from "$components/ui/Notice.svelte";

  import VideoUploadForm from "./VideoUploadForm.svelte";
  import VideoList from "./VideoList.svelte";
  import VideoEditModal from "./VideoEditModal.svelte";
  import "./InstructorVideoStudio.css";

  type Video = AdminVideoRow;

  const auth = initAuth();

  let showUpload = $state(false);
  let actionId = $state<string | null>(null);
  let actionError = $state("");
  let editingVideoObj = $state<Video | null>(null);

  const client = useConvexClient();
  const listQuery = useQuery(api.video.admin.listAll, () => (canRunAuthenticatedQuery() ? {} : "skip"));
  const library = $derived(listQuery.data ?? null);

  const categoriesResource = resource(
    () => auth.isAuthenticated,
    async (isAuthenticated) => {
      if (!isAuthenticated) return [];
      return await authQuery(api.video.categories.listCategories, {});
    },
    { initialValue: [] },
  );
  const categories = $derived(categoriesResource.current ?? []);

  async function handleArchiveVideo(videoId: Id<"videos">) {
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

{#snippet uploadToggle()}
  <Button.Root
    class="hb-button {showUpload ? 'hb-button--paper' : 'hb-button--ink'}"
    type="button"
    onclick={() => {
      showUpload = !showUpload;
    }}
  >
    <span class="material-symbols-rounded" aria-hidden="true">{showUpload ? "close" : "cloud_upload"}</span>
    {showUpload ? "סגירה" : "העלאת שיעור"}
  </Button.Root>
{/snippet}

<PageShell title="ניהול וידאו" headerExtra={uploadToggle}>
  <div class="ivm">
    {#if actionError}
      <Notice tone="danger">{actionError}</Notice>
    {/if}

    {#if showUpload}
      <section class="ivm__upload" aria-label="טופס העלאת שיעור">
        <VideoUploadForm
          {categories}
          onComplete={() => {
            showUpload = false;
          }}
          onCancel={() => {
            showUpload = false;
          }}
        />
      </section>
    {/if}

    <section class="ivm__library" aria-label="רשימת שיעורים">
      <VideoList
        {library}
        {actionId}
        onEdit={(video) => (editingVideoObj = video)}
        onArchive={handleArchiveVideo}
      />
    </section>
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
