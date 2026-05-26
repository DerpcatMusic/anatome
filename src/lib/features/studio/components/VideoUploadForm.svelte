<script lang="ts">
  import "@mux/mux-uploader";
  import { api } from "$convex/_generated/api";
  import type { Id } from "$convex/_generated/dataModel";
  import { videoAccessLabel, type Equipment, type VideoAccessKind } from "$lib/labels";
  import { useConvexClient } from "convex-svelte";
  import { Button, Checkbox, RadioGroup, Progress } from "bits-ui";
  import Notice from "$components/ui/Notice.svelte";
  import EquipmentPicker from "$components/ui/EquipmentPicker.svelte";

  interface Props {
    categories: Array<{ _id: Id<"videoCategories">; name: string }>;
    onComplete: () => void;
    onCancel: () => void;
  }

  let { categories, onComplete, onCancel }: Props = $props();

  const client = useConvexClient();

  let title = $state("");
  let description = $state("");
  let accessKind = $state<VideoAccessKind>("macroflow");
  let selectedCategoryIds = $state<Id<"videoCategories">[]>([]);
  let requiredEquipment = $state<string[]>(["mat"]);
  let file = $state<File | null>(null);
  let isDragOver = $state(false);

  let titleError = $state<string | null>(null);
  let categoryError = $state<string | null>(null);
  let fileError = $state<string | null>(null);

  let step = $state<"idle" | "uploading" | "success" | "error">("idle");
  let progress = $state(0);
  let uploadErrorMsg = $state("");

  let muxUploader = $state<HTMLElement | null>(null);

  const canSubmit = $derived(
    file !== null &&
      title.trim().length >= 3 &&
      selectedCategoryIds.length > 0 &&
      step !== "uploading",
  );

  const accessOptions = [
    {
      value: "macroflow" as const,
      label: videoAccessLabel("macroflow"),
      description: "קרדיט — גישה לצמיתות.",
    },
    {
      value: "microflow" as const,
      label: videoAccessLabel("microflow"),
      description: "למנויות פעילות.",
    },
  ];

  $effect(() => {
    if (!muxUploader) return;

    const onProgress = (e: CustomEvent<number>) => {
      progress = e.detail;
    };
    const onSuccess = () => {
      step = "success";
    };
    const onError = (e: CustomEvent<{ message?: string }>) => {
      step = "error";
      uploadErrorMsg = e.detail?.message ?? "ההעלאה נכשלה. נסי שוב.";
    };

    muxUploader.addEventListener("progress", onProgress as EventListener);
    muxUploader.addEventListener("success", onSuccess as EventListener);
    muxUploader.addEventListener("uploaderror", onError as EventListener);

    return () => {
      muxUploader!.removeEventListener("progress", onProgress as EventListener);
      muxUploader!.removeEventListener("success", onSuccess as EventListener);
      muxUploader!.removeEventListener("uploaderror", onError as EventListener);
    };
  });

  function validate(): boolean {
    titleError = title.trim().length >= 3 ? null : "כותרת קצרה מדי — לפחות 3 תווים.";
    categoryError = selectedCategoryIds.length > 0 ? null : "בחרי לפחות קטגוריה אחת.";
    fileError = file !== null ? null : "צריך לבחור קובץ וידאו.";
    return titleError === null && categoryError === null && fileError === null;
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    isDragOver = false;
    const dropped = e.dataTransfer?.files?.[0];
    if (!dropped) return;
    if (!dropped.type.startsWith("video/")) {
      fileError = "רק קבצי וידאו — MP4, MOV וכדומה.";
      return;
    }
    if (dropped.size > 2 * 1024 * 1024 * 1024) {
      fileError = "הקובץ מעל 2GB. כדאי לדחוס או לקצר לפני העלאה.";
      return;
    }
    file = dropped;
    fileError = null;
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    isDragOver = true;
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    isDragOver = false;
  }

  function handleFileInput(e: Event) {
    const input = e.target as HTMLInputElement;
    const selected = input.files?.[0];
    if (selected) {
      if (selected.size > 2 * 1024 * 1024 * 1024) {
        fileError = "הקובץ מעל 2GB. כדאי לדחוס או לקצר לפני העלאה.";
        input.value = "";
        return;
      }
      file = selected;
      fileError = null;
    }
    input.value = "";
  }

  function clearFile() {
    file = null;
    if (muxUploader) (muxUploader as HTMLElement & { file: File | null }).file = null;
  }

  function toggleCategory(id: Id<"videoCategories">) {
    selectedCategoryIds = selectedCategoryIds.includes(id)
      ? selectedCategoryIds.filter((c) => c !== id)
      : [...selectedCategoryIds, id];
    categoryError = null;
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!validate() || !muxUploader || !file) return;

    step = "uploading";
    progress = 0;
    uploadErrorMsg = "";

    try {
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

      if (!result?.uploadUrl) throw new Error("לא התקבלה כתובת העלאה. רענני ונסי שוב.");

      const uploader = muxUploader as HTMLElement & { endpoint: string; file: File };
      uploader.endpoint = result.uploadUrl;
      uploader.file = file;
    } catch (reason) {
      step = "error";
      uploadErrorMsg = reason instanceof Error ? reason.message : "לא הצלחנו להתחיל העלאה.";
    }
  }

  function handleReset() {
    title = "";
    description = "";
    accessKind = "macroflow";
    selectedCategoryIds = [];
    requiredEquipment = ["mat"];
    file = null;
    step = "idle";
    progress = 0;
    uploadErrorMsg = "";
    titleError = null;
    categoryError = null;
    fileError = null;
    if (muxUploader) {
      const uploader = muxUploader as HTMLElement & { file: File | null; endpoint: string | null };
      uploader.file = null;
      uploader.endpoint = null;
    }
  }
</script>

<mux-uploader bind:this={muxUploader} style="display: none;" hidden aria-hidden="true"></mux-uploader>

<form class="upload-form" onsubmit={handleSubmit}>
  <div class="upload-form__body">
    <div class="upload-form__primary">
      {#if !file}
        <div
          class="drop-zone"
          class:active={isDragOver}
          ondragover={handleDragOver}
          ondragleave={handleDragLeave}
          ondrop={handleDrop}
          role="region"
          aria-label="אזור גרירת קובץ וידאו"
        >
          <span class="material-symbols-rounded drop-icon" aria-hidden="true">video_file</span>
          <div class="drop-text">
            <strong>גררי וידאו לכאן</strong>
            <span>או בחרי מהמחשב · עד 2GB</span>
          </div>
          <label class="browse-wrap">
            <Button.Root class="hb-button hb-button--ink" type="button">בחירת קובץ</Button.Root>
            <input type="file" accept="video/*" onchange={handleFileInput} />
          </label>
          {#if fileError}
            <span class="field-error" role="alert">{fileError}</span>
          {/if}
        </div>
      {:else}
        <div class="file-chip">
          <span class="material-symbols-rounded file-chip__icon" aria-hidden="true">movie</span>
          <span class="file-chip__name">{file.name}</span>
          <span class="file-chip__meta">{(file.size / (1024 * 1024)).toFixed(1)} MB</span>
          <Button.Root
            class="hb-button hb-button--icon hb-button--icon-danger"
            type="button"
            onclick={clearFile}
            aria-label="הסרת קובץ"
          >
            <span class="material-symbols-rounded">close</span>
          </Button.Root>
        </div>
      {/if}

      <label class="field" class:invalid={titleError !== null}>
        <span class="field-label">כותרת השיעור <span class="required" aria-hidden="true">*</span></span>
        <input
          type="text"
          bind:value={title}
          placeholder="לדוגמה: יסודות רפורמר למתחילות"
          maxlength="120"
          disabled={step === "uploading"}
          autocomplete="off"
        />
        {#if titleError}
          <span class="field-error" role="alert">{titleError}</span>
        {/if}
      </label>

      <label class="field">
        <span class="field-label">תיאור (אופציונלי)</span>
        <textarea
          bind:value={description}
          placeholder="מה נעשה בשיעור? למי הוא מתאים?"
          maxlength="500"
          rows="3"
          disabled={step === "uploading"}
        ></textarea>
      </label>
    </div>

    <div class="upload-form__meta">
      <div class="field-group access-grid">
        <span class="field-label">איך לקוחות יגיעו לשיעור? <span class="required" aria-hidden="true">*</span></span>
        <RadioGroup.Root bind:value={accessKind} orientation="horizontal" class="hb-choice-grid">
          {#each accessOptions as option}
            <RadioGroup.Item value={option.value} class="hb-choice">
              <span class="hb-choice__title">{option.label}</span>
              <span class="hb-choice__description">{option.description}</span>
            </RadioGroup.Item>
          {/each}
        </RadioGroup.Root>
      </div>

      <div class="field-group" class:invalid={categoryError !== null}>
        <span class="field-label">
          קטגוריות
          <span class="required" aria-hidden="true">*</span>
          {#if selectedCategoryIds.length > 0}
            <span class="count-pill">{selectedCategoryIds.length}</span>
          {/if}
        </span>
        {#if categories.length === 0}
          <Notice tone="neutral">עדיין אין קטגוריות במערכת. פני למנהלת להוספה.</Notice>
        {:else}
          <div class="category-grid">
            {#each categories as cat (cat._id)}
              <Checkbox.Root
                class="hb-choice"
                checked={selectedCategoryIds.includes(cat._id)}
                onchange={() => toggleCategory(cat._id)}
                disabled={step === "uploading"}
              >
                <span class="hb-choice__title">{cat.name}</span>
              </Checkbox.Root>
            {/each}
          </div>
        {/if}
        {#if categoryError}
          <span class="field-error" role="alert">{categoryError}</span>
        {/if}
      </div>

      <div class="field-group equipment-section">
        <EquipmentPicker bind:selected={requiredEquipment} label="ציוד בשיעור" disabled={step === "uploading"} />
      </div>
    </div>
  </div>

  {#if step === "uploading"}
    <div class="status-box uploading" role="status" aria-live="polite">
      <div class="status-header">
        <span>מעלה את הקובץ…</span>
        <span class="status-percent">{Math.round(progress)}%</span>
      </div>
      <Progress.Root class="progress-track" value={progress} max={100}>
        <div class="progress-fill" style:width="{progress}%"></div>
      </Progress.Root>
    </div>
  {:else if step === "success"}
    <div class="status-box success" role="status">
      <span class="material-symbols-rounded status-icon" aria-hidden="true">check_circle</span>
      <div class="status-text">
        <strong>הועלה בהצלחה</strong>
        <span>השיעור יופיע בספרייה אחרי עיבוד (בדרך כלל 2–5 דקות).</span>
      </div>
    </div>
  {:else if step === "error"}
    <div class="status-box error" role="alert">
      <span class="material-symbols-rounded status-icon" aria-hidden="true">error</span>
      <span class="status-text">{uploadErrorMsg}</span>
    </div>
  {/if}

  <div class="upload-form__actions">
    {#if step === "success"}
      <Button.Root class="hb-button hb-button--paper" type="button" onclick={handleReset}>
        העלאת שיעור נוסף
      </Button.Root>
      <Button.Root class="hb-button hb-button--ink" type="button" onclick={onComplete}>סיום</Button.Root>
    {:else}
      <Button.Root
        class="hb-button hb-button--ghost"
        type="button"
        onclick={onCancel}
        disabled={step === "uploading"}
      >
        ביטול
      </Button.Root>
      <Button.Root
        class="hb-button hb-button--ink"
        type="submit"
        disabled={!canSubmit || step === "uploading"}
      >
        {step === "uploading" ? "מעלה…" : "העלאה לספרייה"}
      </Button.Root>
    {/if}
  </div>
</form>
