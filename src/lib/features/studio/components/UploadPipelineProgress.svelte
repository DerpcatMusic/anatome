<script lang="ts">
  import { Progress } from "bits-ui";

  type PipelinePhase =
    | "uploading"
    | "waiting_mux"
    | "encoding"
    | "ready"
    | "failed";

  let {
    uploadPercent = 0,
    phase = "uploading",
    phaseLabel = "",
    muxUploadStatus = null,
    muxAssetStatus = null,
    errorMessage = null,
  }: {
    uploadPercent?: number;
    phase?: PipelinePhase;
    phaseLabel?: string;
    muxUploadStatus?: string | null;
    muxAssetStatus?: string | null;
    errorMessage?: string | null;
  } = $props();

  const steps = [
    { id: "upload", label: "העלאת קובץ" },
    { id: "mux", label: "קבלה ב-Mux" },
    { id: "encode", label: "קידוד" },
    { id: "done", label: "מוכן" },
  ] as const;

  const activeStep = $derived.by(() => {
    if (phase === "failed") return 0;
    if (phase === "uploading") return 0;
    if (phase === "waiting_mux") return 1;
    if (phase === "encoding") return 2;
    if (phase === "ready") return 3;
    return 0;
  });
</script>

<div class="upload-pipeline" aria-live="polite">
  <ol class="upload-pipeline__steps">
    {#each steps as step, index (step.id)}
      <li
        class="upload-pipeline__step"
        class:is-done={index < activeStep || phase === "ready"}
        class:is-active={index === activeStep && phase !== "ready" && phase !== "failed"}
        class:is-failed={phase === "failed" && index === activeStep}
      >
        <span class="upload-pipeline__dot" aria-hidden="true"></span>
        <span class="upload-pipeline__step-label">{step.label}</span>
      </li>
    {/each}
  </ol>

  {#if phase === "uploading"}
    <div class="upload-pipeline__bar-wrap">
      <Progress.Root class="upload-pipeline__bar" value={uploadPercent} max={100}>
        <div class="upload-pipeline__bar-fill" style:width="{uploadPercent}%"></div>
      </Progress.Root>
      <span class="upload-pipeline__pct">{Math.round(uploadPercent)}%</span>
    </div>
  {:else if phase === "ready"}
    <p class="upload-pipeline__message upload-pipeline__message--success">{phaseLabel}</p>
  {:else if phase === "failed"}
    <p class="upload-pipeline__message upload-pipeline__message--error">{errorMessage ?? phaseLabel}</p>
  {:else}
    <Progress.Root class="upload-pipeline__bar upload-pipeline__bar--indeterminate" value={null} max={100}>
      <div class="upload-pipeline__bar-fill upload-pipeline__bar-fill--indeterminate" aria-hidden="true"></div>
    </Progress.Root>
    <p class="upload-pipeline__message">{phaseLabel}</p>
    <p class="upload-pipeline__mux-meta">
      {#if muxUploadStatus}
        העלאה ב-Mux: <strong>{muxUploadStatus}</strong>
      {/if}
      {#if muxAssetStatus}
        {#if muxUploadStatus}
          ·
        {/if}
        נכס: <strong>{muxAssetStatus}</strong>
      {/if}
    </p>
    <p class="upload-pipeline__note">Mux לא מפרסם אחוזי קידוד, רק שלב (preparing → ready).</p>
  {/if}
</div>
