<script lang="ts">
  import "@mux/mux-uploader";
  import { api } from "$convex/_generated/api";
  import type { Id } from "$convex/_generated/dataModel";
  import { videoAccessLabel, type Equipment, type VideoAccessKind } from "$lib/labels";
  import { useConvexClient } from "convex-svelte";
  import { Button, Progress } from "bits-ui";
  import Notice from "$components/ui/Notice.svelte";
  import VideoUploadMetadata from "./VideoUploadMetadata.svelte";

  interface Props {
    categories: Array<{ _id: Id<"videoCategories">; name: string }>;
    onComplete: () => void;
    onCancel: () => void;
  }

  type MuxUploaderEl = HTMLElement & {
    endpoint?: string | (() => Promise<string>);
    file: File | null;
    dispatchEvent: (event: Event) => boolean;
  };

  let { categories, onComplete, onCancel }: Props = $props();

  const client = useConvexClient();

  const UPLOADER_ID = "hb-video-uploader";
  const MAX_FILE_SIZE_KB = 2 * 1024 * 1024;

  let title = $state("");
  let description = $state("");
  let accessKind = $state<VideoAccessKind>("macroflow");
  let selectedCategoryIds = $state<Id<"videoCategories">[]>([]);
  let requiredEquipment = $state<string[]>(["mat"]);

  let titleError = $state<string | null>(null);
  let categoryError = $state<string | null>(null);
  let fileError = $state<string | null>(null);
  let selectedFileName = $state<string | null>(null);

  let step = $state<"idle" | "preparing" | "uploading" | "success" | "error">("idle");
  let progress = $state(0);
  let uploadErrorMsg = $state("");
  let isOffline = $state(false);

  let muxUploader = $state<MuxUploaderEl | null>(null);

  const isBusy = $derived(step === "preparing" || step === "uploading");
  const metadataReady = $derived(title.trim().length >= 3 && selectedCategoryIds.length > 0);

  const phaseLabel = $derived.by(() => {
    if (step === "preparing") return "מכינה כתובת העלאה…";
    if (step === "uploading" && isOffline) return "ממתינה לחיבור…";
    if (step === "uploading") return "מעלה את הקובץ…";
    return "";
  });

  function validateMetadata(): boolean {
    titleError = title.trim().length >= 3 ? null : "כותרת קצרה מדי — לפחות 3 תווים.";
    categoryError = selectedCategoryIds.length > 0 ? null : "בחרי לפחות קטגוריה אחת.";
    return titleError === null && categoryError === null;
  }

  async function resolveUploadEndpoint(): Promise<string> {
    if (!validateMetadata()) {
      throw new Error("מלאי כותרת וקטגוריה לפני בחירת הקובץ.");
    }

    step = "preparing";
    progress = 0;
    uploadErrorMsg = "";
    isOffline = false;
    fileError = null;

    const result = await client.action(api.video.uploads.requestUpload, {
      title: title.trim(),
      description: description.trim(),
      requiredEquipment: requiredEquipment as Equipment[],
      accessKind,
      categoryIds: selectedCategoryIds,
      muxVideoQuality: "plus",
      muxMaxResolutionTier: "1080p",
      staticRendition: "none",
    });

    if (!result?.uploadUrl) {
      throw new Error("לא התקבלה כתובת העלאה. רענני ונסי שוב.");
    }

    await client.mutation(api.video.admin.markUploadStarted, { videoId: result.videoId });
    return result.uploadUrl;
  }

  $effect(() => {
    if (!muxUploader) return;
    muxUploader.endpoint = resolveUploadEndpoint;
  });

  $effect(() => {
    const uploader = muxUploader;
    if (!uploader) return;

    const onProgress = (e: CustomEvent<number>) => {
      progress = typeof e.detail === "number" ? e.detail : 0;
    };
    const onFileReady = (e: CustomEvent<File>) => {
      const picked = e.detail;
      selectedFileName = picked?.name ?? null;
      fileError = null;
      if (!metadataReady) {
        fileError = "מלאי כותרת וקטגוריה לפני בחירת הקובץ.";
      }
    };
    const onUploadStart = () => {
      step = "uploading";
      progress = 0;
    };
    const onSuccess = () => {
      step = "success";
      progress = 100;
    };
    const onError = (e: CustomEvent<{ message?: string }>) => {
      step = "error";
      uploadErrorMsg = e.detail?.message ?? "ההעלאה נכשלה. נסי שוב.";
    };
    const onReset = () => {
      step = "idle";
      progress = 0;
      uploadErrorMsg = "";
      selectedFileName = null;
      fileError = null;
    };
    const onOffline = () => {
      isOffline = true;
    };
    const onOnline = () => {
      isOffline = false;
    };

    uploader.addEventListener("progress", onProgress as EventListener);
    uploader.addEventListener("file-ready", onFileReady as EventListener);
    uploader.addEventListener("uploadstart", onUploadStart as EventListener);
    uploader.addEventListener("success", onSuccess as EventListener);
    uploader.addEventListener("uploaderror", onError as EventListener);
    uploader.addEventListener("reset", onReset as EventListener);
    uploader.addEventListener("offline", onOffline as EventListener);
    uploader.addEventListener("online", onOnline as EventListener);

    return () => {
      uploader.removeEventListener("progress", onProgress as EventListener);
      uploader.removeEventListener("file-ready", onFileReady as EventListener);
      uploader.removeEventListener("uploadstart", onUploadStart as EventListener);
      uploader.removeEventListener("success", onSuccess as EventListener);
      uploader.removeEventListener("uploaderror", onError as EventListener);
      uploader.removeEventListener("reset", onReset as EventListener);
      uploader.removeEventListener("offline", onOffline as EventListener);
      uploader.removeEventListener("online", onOnline as EventListener);
    };
  });

  function handleReset() {
    title = "";
    description = "";
    accessKind = "macroflow";
    selectedCategoryIds = [];
    requiredEquipment = ["mat"];
    step = "idle";
    progress = 0;
    uploadErrorMsg = "";
    isOffline = false;
    selectedFileName = null;
    titleError = null;
    categoryError = null;
    fileError = null;
    if (muxUploader) {
      muxUploader.file = null;
      muxUploader.dispatchEvent(new Event("reset"));
    }
  }
</script>

<mux-uploader
  id={UPLOADER_ID}
  bind:this={muxUploader}
  class="mux-uploader-host"
  no-drop
  no-progress
  no-status
  no-retry
  pausable
  dynamic-chunk-size
  max-file-size={MAX_FILE_SIZE_KB}
></mux-uploader>

<div class="upload-form">
  <VideoUploadMetadata
    bind:title
    bind:description
    bind:accessKind
    bind:selectedCategoryIds
    bind:requiredEquipment
    {categories}
    {isBusy}
    {titleError}
    {categoryError}
  />

  {#if step !== "success"}
    <section
      class="mux-upload-zone"
      class:is-disabled={isBusy}
      class:metadata-pending={!metadataReady}
      aria-label="העלאת קובץ וידאו"
    >
      {#if !metadataReady}
        <p class="mux-upload-zone__gate">מלאי כותרת ולפחות קטגוריה אחת — ואז אפשר לבחור קובץ.</p>
      {/if}

      <mux-uploader-drop
        mux-uploader={UPLOADER_ID}
        overlay
        overlay-text="שחררי את הקובץ כאן"
        class="mux-uploader-drop"
      >
        <span slot="heading" class="mux-drop-heading">
          <span class="material-symbols-rounded mux-drop-icon" aria-hidden="true">video_file</span>
          גררי וידאו לכאן
        </span>
        <span slot="separator" class="mux-drop-separator">או</span>
        <div class="mux-drop-actions">
          <mux-uploader-file-select mux-uploader={UPLOADER_ID} class="mux-file-select">
            <button type="button" class="hb-button hb-button--ink">בחירת קובץ</button>
          </mux-uploader-file-select>
          <span class="mux-drop-hint">עד 2GB · MP4, MOV וכדומה</span>
        </div>
      </mux-uploader-drop>

      {#if selectedFileName && step === "idle"}
        <p class="mux-selected-file" role="status">
          <span class="material-symbols-rounded" aria-hidden="true">movie</span>
          {selectedFileName}
        </p>
      {/if}

      {#if fileError}
        <span class="field-error" role="alert">{fileError}</span>
      {/if}
    </section>
  {/if}

  {#if step === "preparing" || step === "uploading"}
    <section class="upload-progress-panel status-box uploading" aria-live="polite" aria-busy="true">
      <div class="status-header">
        <span class="status-phase">{phaseLabel}</span>
        {#if step === "uploading"}
          <mux-uploader-progress mux-uploader={UPLOADER_ID} type="percentage" class="mux-progress-pct"></mux-uploader-progress>
        {/if}
      </div>

      {#if step === "preparing"}
        <Progress.Root class="progress-track progress-track--indeterminate" value={null} max={100}>
          <div class="progress-fill progress-fill--indeterminate" aria-hidden="true"></div>
        </Progress.Root>
        <p class="upload-hint">יוצרת שורה בספרייה ומבקשת כתובת מ-Mux…</p>
      {:else}
        <mux-uploader-progress mux-uploader={UPLOADER_ID} type="bar" class="mux-progress-bar"></mux-uploader-progress>
        <mux-uploader-status mux-uploader={UPLOADER_ID} class="mux-upload-status"></mux-uploader-status>
        <div class="upload-controls">
          <mux-uploader-pause mux-uploader={UPLOADER_ID} class="mux-pause"></mux-uploader-pause>
        </div>
        {#if isOffline}
          <Notice tone="neutral">אין חיבור — ההעלאה תמשיך אוטומטית כשהרשת חוזרת.</Notice>
        {/if}
        <p class="upload-hint">אפשר להשהות ולהמשיך. אחרי 100% Mux מעבד את הווידאו (2–5 דקות).</p>
      {/if}
    </section>
  {:else if step === "success"}
    <div class="status-box success" role="status">
      <span class="material-symbols-rounded status-icon" aria-hidden="true">check_circle</span>
      <div class="status-text">
        <strong>הועלה בהצלחה</strong>
        <span>הקובץ אצל Mux. השיעור יופיע בספרייה אחרי עיבוד (בדרך כלל 2–5 דקות).</span>
      </div>
    </div>
  {:else if step === "error"}
    <div class="status-box error" role="alert">
      <span class="material-symbols-rounded status-icon" aria-hidden="true">error</span>
      <div class="status-text">
        <strong>ההעלאה נכשלה</strong>
        <span>{uploadErrorMsg}</span>
      </div>
      <mux-uploader-retry mux-uploader={UPLOADER_ID} class="mux-retry"></mux-uploader-retry>
    </div>
  {/if}

  <div class="upload-form__actions">
    {#if step === "success"}
      <Button.Root class="hb-button hb-button--paper" type="button" onclick={handleReset}>
        העלאת שיעור נוסף
      </Button.Root>
      <Button.Root class="hb-button hb-button--ink" type="button" onclick={onComplete}>סיום</Button.Root>
    {:else}
      <Button.Root class="hb-button hb-button--ghost" type="button" onclick={onCancel} disabled={isBusy}>
        ביטול
      </Button.Root>
    {/if}
  </div>
</div>
