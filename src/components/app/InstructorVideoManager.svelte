<script lang="ts">
  import { resource } from "runed";
  import { api } from "../../../convex/_generated/api";
  import type { FunctionReturnType } from "convex/server";
  import type { Id } from "../../../convex/_generated/dataModel";
  import { authQuery, initAuth } from "../../lib/auth/session.svelte";
  import { convex } from "../../lib/convex/client";
  import { equipmentLabel, durationLabel, type Equipment } from "../../lib/labels";
  import AppLayout from "./AppLayout.svelte";
  import PageShell from "./PageShell.svelte";
  import FormSection from "./FormSection.svelte";
  import Notice from "../ui/Notice.svelte";
  import EquipmentPicker from "../ui/EquipmentPicker.svelte";

  type VideoList = FunctionReturnType<typeof api.videos.listAll>;

  const auth = initAuth();
  let tab = $state<"upload" | "library">("library");

  // Upload form state
  let title = $state("");
  let description = $state("");
  let requiredEquipment = $state<Equipment[]>(["mat"]);
  let videoFile = $state<File | null>(null);
  let uploadProgress = $state(0);
  let uploadStatus = $state<"idle" | "uploading" | "processing" | "ready" | "error">("idle");
  let uploadError = $state("");
  let draftVideoId = $state<Id<"videos"> | null>(null);

  // Library state
  let actionId = $state<string | null>(null);
  let actionError = $state("");
  let editingVideo = $state<Id<"videos"> | null>(null);
  let editTitle = $state("");
  let editDescription = $state("");

  const listResource = resource(
    () => auth.isAuthenticated,
    async (isAuthenticated) => {
      if (!isAuthenticated) return null;
      return await authQuery(api.videos.listAll, {});
    }
  );

  const library = $derived(listResource.current);

  function startOfWeek() {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday.getTime();
  }

  function endOfWeek() {
    const start = startOfWeek();
    return start + 7 * 24 * 60 * 60 * 1000 - 1;
  }

  function toDateTimeLocal(ts: number) {
    const d = new Date(ts);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  let availableFrom = $state(toDateTimeLocal(startOfWeek()));
  let availableUntil = $state(toDateTimeLocal(endOfWeek()));

  function onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      videoFile = input.files[0];
      if (videoFile.size > 2 * 1024 * 1024 * 1024) {
        uploadError = "הקובץ גדול מ-2GB. צריך לדחוס או לחתוך.";
        videoFile = null;
        input.value = "";
        return;
      }
      uploadError = "";
    }
  }

  async function startUpload() {
    if (!videoFile || title.trim().length < 3) return;
    uploadStatus = "uploading";
    uploadProgress = 0;
    uploadError = "";

    try {
      const result = await convex.action(api.videosUpload.requestUpload, {
        title: title.trim(),
        description: description.trim(),
        requiredEquipment,
        availableFrom: new Date(availableFrom).getTime(),
        availableUntil: new Date(availableUntil).getTime(),
      });
      if (!result?.uploadUrl) {
        uploadStatus = "error";
        uploadError = "לא הצלחנו ליצור כתובת העלאה.";
        return;
      }
      const videoId = result.videoId;
      const uploadUrl = result.uploadUrl;
      draftVideoId = videoId;

      if (videoFile === null) {
        uploadStatus = "error";
        uploadError = "לא נבחר קובץ.";
        return;
      }
      await uploadToMux(uploadUrl, videoFile);
      uploadStatus = "processing";

      setTimeout(() => {
        if (uploadStatus === "processing") {
          uploadStatus = "ready";
          title = "";
          description = "";
          videoFile = null;
          uploadProgress = 0;
          draftVideoId = null;
          tab = "library";
          void listResource.refetch();
        }
      }, 3000);
    } catch (reason) {
      uploadStatus = "error";
      uploadError = reason instanceof Error ? reason.message : "ההעלאה נכשלה.";
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
        else reject(new Error(`Upload failed: ${xhr.status}`));
      });
      xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
      xhr.open("PUT", url);
      xhr.setRequestHeader("Content-Type", file.type || "video/mp4");
      xhr.send(file);
    });
  }

  async function deleteVideo(videoId: Id<"videos">) {
    actionId = videoId;
    actionError = "";
    try {
      await convex.mutation(api.videos.deleteVideo, { videoId });
      await listResource.refetch();
    } catch (reason) {
      actionError = reason instanceof Error ? reason.message : "לא הצלחנו למחוק.";
    } finally {
      actionId = null;
    }
  }

  async function publishVideo(videoId: Id<"videos">) {
    actionId = videoId;
    actionError = "";
    try {
      await convex.mutation(api.videos.updateMetadata, { videoId, status: "published" });
      await listResource.refetch();
    } catch (reason) {
      actionError = reason instanceof Error ? reason.message : "לא הצלחנו לפרסם.";
    } finally {
      actionId = null;
    }
  }

  function startEdit(video: VideoList["published"][number]) {
    editingVideo = video._id;
    editTitle = video.title;
    editDescription = video.description;
  }

  async function saveEdit(videoId: Id<"videos">) {
    actionId = videoId;
    try {
      await convex.mutation(api.videos.updateMetadata, {
        videoId,
        title: editTitle,
        description: editDescription,
      });
      editingVideo = null;
      await listResource.refetch();
    } catch (reason) {
      actionError = reason instanceof Error ? reason.message : "שגיאה בשמירה.";
    } finally {
      actionId = null;
    }
  }

  function statusBadgeClass(status: string) {
    if (status === "published") return "badge--published";
    if (status === "draft") return "badge--draft";
    return "badge--archived";
  }

  function statusBadgeLabel(status: string) {
    if (status === "published") return "פעיל";
    if (status === "draft") return "טיוטה";
    return "בארכיון";
  }
</script>

<AppLayout>
  <PageShell
    kicker="HomeBody Studio"
    title="ניהול וידאו"
    description="העלאת שיעורי וידאו, ניהול תוכן, וקביעת לוח זמנים שבועי."
  >
    {#if actionError}
      <Notice tone="danger">{actionError}</Notice>
    {/if}

    <!-- Brutalist tabs -->
    <div class="tabs" role="tablist">
      <button
        class="tab"
        class:active={tab === "library"}
        onclick={() => tab = "library"}
        role="tab"
        aria-selected={tab === "library"}
      >
        ספריה
      </button>
      <button
        class="tab"
        class:active={tab === "upload"}
        onclick={() => tab = "upload"}
        role="tab"
        aria-selected={tab === "upload"}
      >
        העלאה חדשה
      </button>
    </div>

    {#if tab === "upload"}
      <FormSection title="העלאת וידאו חדש">
        {#if uploadStatus === "ready"}
          <Notice tone="success">הווידאו הועלה בהצלחה! מעבדים אותו עכשיו — יופיע בספריה תוך כמה דקות.</Notice>
        {:else if uploadStatus === "processing"}
          <div class="upload-progress">
            <p>הקובץ הועלה. מעבדים אותו בשרת...</p>
            <div class="progress-bar"><div class="progress-fill" style="width: 100%"></div></div>
          </div>
        {:else if uploadStatus === "error"}
          <Notice tone="danger">{uploadError}</Notice>
        {/if}

        <form onsubmit={(e) => { e.preventDefault(); void startUpload(); }}>
          <label class="file-drop">
            <input type="file" accept="video/*" onchange={onFileSelect} disabled={uploadStatus === "uploading"} />
            {#if videoFile}
              <span class="file-name">{videoFile.name}</span>
              <span class="file-size">{(videoFile.size / (1024 * 1024)).toFixed(1)} MB</span>
            {:else}
              <span class="drop-text">גררי קובץ וידאו לכאן<br /><small>או לחצי לבחירה</small></span>
            {/if}
          </label>

          {#if uploadStatus === "uploading"}
            <div class="upload-progress">
              <span class="progress-label">{uploadProgress}%</span>
              <div class="progress-bar"><div class="progress-fill" style="width: {uploadProgress}%"></div></div>
            </div>
          {/if}

          <label class="field">
            <span class="field__label">כותרת</span>
            <input bind:value={title} required maxlength="120" disabled={uploadStatus === "uploading"} />
          </label>

          <label class="field">
            <span class="field__label">תיאור</span>
            <textarea bind:value={description} rows="3" maxlength="500" disabled={uploadStatus === "uploading"}></textarea>
          </label>

          <div class="form-grid">
            <label class="field">
              <span class="field__label">זמין מ-</span>
              <input type="datetime-local" bind:value={availableFrom} disabled={uploadStatus === "uploading"} />
            </label>
            <label class="field">
              <span class="field__label">זמין עד-</span>
              <input type="datetime-local" bind:value={availableUntil} disabled={uploadStatus === "uploading"} />
            </label>
          </div>

          <EquipmentPicker
            bind:selected={requiredEquipment}
            disabled={uploadStatus === "uploading"}
          />

          <button class="btn btn--ink primary-action" type="submit" disabled={!videoFile || title.trim().length < 3 || uploadStatus === "uploading"}>
            {uploadStatus === "uploading" ? "מעלה..." : "להעלות וידאו"}
          </button>
        </form>
      </FormSection>
    {:else}
      <!-- Library -->
      {#if listResource.loading}
        <div class="skeleton-card">
          <div class="skeleton skeleton--lg"></div>
          <div class="skeleton"></div>
        </div>
      {:else if library}
        <div class="library">
          {#if library.published.length > 0}
            <section class="library-section">
              <h2 class="section-title">פעילים <span class="count">({library.published.length})</span></h2>
              <div class="video-grid">
                {#each library.published as video}
                  <article class="video-card">
                    <div class="thumb">
                      {#if video.thumbnailUrl}
                        <img src={video.thumbnailUrl} alt="" loading="lazy" />
                      {:else}
                        <span class="thumb-placeholder">{durationLabel(video.durationSeconds)}</span>
                      {/if}
                      <span class="thumb-badge {statusBadgeClass(video.status)}">{statusBadgeLabel(video.status)}</span>
                    </div>

                    {#if editingVideo === video._id}
                      <div class="card-edit">
                        <input class="edit-input" bind:value={editTitle} />
                        <textarea class="edit-textarea" bind:value={editDescription} rows="2"></textarea>
                        <div class="edit-actions">
                          <button class="btn btn--ink" onclick={() => saveEdit(video._id)} disabled={actionId === video._id}>שמור</button>
                          <button class="btn btn--ghost" onclick={() => editingVideo = null}>ביטול</button>
                        </div>
                      </div>
                    {:else}
                      <div class="card-body">
                        <h3>{video.title}</h3>
                        <p class="desc">{video.description}</p>
                        <div class="tags">
                          <span class="tag">{durationLabel(video.durationSeconds)}</span>
                          {#each video.requiredEquipment as eq}
                            <span class="tag">{equipmentLabel(eq)}</span>
                          {/each}
                        </div>
                        <div class="card-actions">
                          <button class="action" onclick={() => startEdit(video)}>ערוך</button>
                          <button class="action" onclick={() => publishVideo(video._id)} disabled={actionId === video._id}>פרסם</button>
                          <button class="action action--danger" onclick={() => deleteVideo(video._id)} disabled={actionId === video._id}>מחק</button>
                        </div>
                      </div>
                    {/if}
                  </article>
                {/each}
              </div>
            </section>
          {/if}

          {#if library.drafts.length > 0}
            <section class="library-section">
              <h2 class="section-title">טיוטות <span class="count">({library.drafts.length})</span></h2>
              <div class="draft-list">
                {#each library.drafts as video}
                  <article class="draft-row">
                    <div class="draft-info">
                      <h3>{video.title}</h3>
                      <p class="desc">{video.description || "אין תיאור"}</p>
                      <span class="badge {statusBadgeClass(video.status)}">{statusBadgeLabel(video.status)}</span>
                    </div>
                    <div class="draft-actions">
                      <button class="btn btn--ink" onclick={() => publishVideo(video._id)} disabled={actionId === video._id}>פרסם</button>
                      <button class="btn btn--ghost danger" onclick={() => deleteVideo(video._id)} disabled={actionId === video._id}>מחק</button>
                    </div>
                  </article>
                {/each}
              </div>
            </section>
          {/if}

          {#if library.published.length === 0 && library.drafts.length === 0}
            <p class="empty">אין עדיין וידאו בספריה. העלי את השיעור הראשון בלשונית "העלאה חדשה".</p>
          {/if}
        </div>
      {:else}
        <p class="empty">טוען ספריה...</p>
      {/if}
    {/if}
  </PageShell>
</AppLayout>

<style>
  /* Tabs */
  .tabs {
    display: flex;
    gap: var(--space-2);
  }

  .tab {
    flex: 1;
    padding: var(--space-4) var(--space-5);
    border: var(--border);
    background: var(--white);
    color: var(--ink);
    font: inherit;
    font-weight: 900;
    font-size: var(--step-0);
    cursor: pointer;
    transition: background var(--duration-fast), color var(--duration-fast);
  }

  .tab:hover {
    background: var(--surface);
  }

  .tab.active {
    background: var(--ink);
    color: var(--white);
    border-color: var(--ink);
  }

  /* Upload */
  form {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  .file-drop {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    border: 2px dashed var(--line-light);
    padding: var(--space-8) var(--space-6);
    text-align: center;
    cursor: pointer;
    transition: background var(--duration-fast), border-color var(--duration-fast);
    min-height: 160px;
  }

  .file-drop:hover {
    background: var(--surface);
    border-color: var(--sky-strong);
  }

  .file-drop input {
    position: absolute;
    opacity: 0;
  }

  .file-name {
    font-weight: 800;
    font-size: var(--step-1);
  }

  .file-size {
    color: var(--muted);
    font-family: var(--font-mono);
  }

  .drop-text {
    color: var(--muted);
    font-size: var(--step-1);
  }

  .drop-text small {
    font-size: var(--step-0);
  }

  .upload-progress {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .progress-label {
    font-family: var(--font-mono);
    font-size: var(--step-1);
    font-weight: 900;
  }

  .progress-bar {
    height: 12px;
    background: var(--line-light);
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: var(--sky-strong);
    transition: width 0.2s;
  }

  .equipment-picker {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .primary-action {
    width: fit-content;
  }

  /* Library */
  .library {
    display: flex;
    flex-direction: column;
    gap: var(--space-7);
  }

  .section-title {
    font-size: var(--step-1);
    margin: 0 0 var(--space-4);
    font-weight: 700;
  }

  .count {
    color: var(--muted);
    font-family: var(--font-mono);
    font-size: var(--step-0);
  }

  .video-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--space-4);
  }

  .video-card {
    border: var(--border);
    background: var(--white);
    display: flex;
    flex-direction: column;
  }

  .thumb {
    aspect-ratio: 16 / 9;
    background: var(--ink);
    color: var(--white);
    display: grid;
    place-items: center;
    position: relative;
    overflow: hidden;
  }

  .thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .thumb-placeholder {
    font-family: var(--font-mono);
    font-size: var(--step--1);
    font-weight: 700;
  }

  .thumb-badge {
    position: absolute;
    top: var(--space-2);
    right: var(--space-2);
    font-family: var(--font-mono);
    font-size: var(--step--2);
    font-weight: 700;
    text-transform: uppercase;
    padding: 2px 8px;
    border: var(--border);
    background: var(--white);
    color: var(--ink);
  }

  .badge--published {
    background: #e8f5ee;
    border-color: #137333;
    color: #137333;
  }

  .badge--draft {
    background: var(--surface);
    border-color: var(--line);
    color: var(--muted);
  }

  .badge--archived {
    background: #fef2f2;
    border-color: #b42318;
    color: #b42318;
  }

  .card-body {
    padding: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .card-body h3 {
    margin: 0;
    font-size: var(--step-1);
    line-height: 1.2;
  }

  .desc {
    margin: 0;
    color: var(--muted);
    line-height: 1.5;
    display: -webkit-box;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    box-orient: vertical;
    overflow: hidden;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .tag {
    border: 1px solid var(--line-light);
    background: var(--surface);
    padding: var(--space-1) var(--space-2);
    font-size: var(--step--1);
    font-weight: 700;
  }

  .card-actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-top: auto;
    padding-top: var(--space-2);
  }

  .action {
    border: 0;
    background: transparent;
    color: var(--ink);
    font: inherit;
    font-weight: 700;
    font-size: var(--step--1);
    cursor: pointer;
    padding: var(--space-1) var(--space-2);
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .action:hover {
    color: var(--sky-strong);
  }

  .action--danger {
    color: #b42318;
  }

  .action--danger:hover {
    color: #991b1b;
  }

  /* Inline edit */
  .card-edit {
    padding: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .edit-input,
  .edit-textarea {
    border: var(--border);
    padding: var(--space-2);
    font: inherit;
    width: 100%;
  }

  .edit-textarea {
    min-height: 60px;
    resize: vertical;
  }

  .edit-actions {
    display: flex;
    gap: var(--space-2);
  }

  /* Drafts */
  .draft-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .draft-row {
    border: var(--border);
    background: var(--white);
    padding: var(--space-4);
    display: flex;
    justify-content: space-between;
    align-items: start;
    gap: var(--space-4);
  }

  .draft-info {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    min-width: 0;
  }

  .draft-info h3 {
    margin: 0;
    font-size: var(--step-1);
  }

  .draft-info .desc {
    margin: 0;
    color: var(--muted);
    line-height: 1.5;
  }

  .draft-actions {
    display: flex;
    gap: var(--space-2);
    flex-shrink: 0;
  }

  .badge {
    font-family: var(--font-mono);
    font-size: var(--step--2);
    font-weight: 700;
    text-transform: uppercase;
    padding: 2px 8px;
    border: var(--border);
    width: fit-content;
  }

  .empty {
    color: var(--muted);
    padding: var(--space-5);
    border: var(--border);
    background: var(--white);
  }

  @media (max-width: 760px) {
    .form-grid {
      grid-template-columns: 1fr;
    }

    .draft-row {
      flex-direction: column;
    }

    .video-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
