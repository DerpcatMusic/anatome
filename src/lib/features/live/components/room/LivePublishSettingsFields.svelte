<script lang="ts">
  import { Switch } from "bits-ui";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import LiveBrowserMediaHints from "./LiveBrowserMediaHints.svelte";
  import LivePublishPresets from "./LivePublishPresets.svelte";
  import LivePublishStackFields from "./LivePublishStackFields.svelte";
  import LivePublishAdvancedFields from "./LivePublishAdvancedFields.svelte";
  import type { LiveSessionPreConnect } from "$lib/features/live/live-session.svelte";

  let {
    session,
    mode = "prep",
    showPresets = true,
    showEchoToggle = true,
  }: {
    session: LiveSessionPreConnect;
    mode?: "prep" | "compact";
    showPresets?: boolean;
    showEchoToggle?: boolean;
  } = $props();

  const { t } = useI18n();

  const selectOverlayClass = "hb-select__content lr-select-overlay";

  function afterPublishFieldChange(syncResolution = false) {
    if (session.selectedFramerate > 30 && session.simulcastEnabled) {
      session.simulcastEnabled = false;
    }
    const canApplyLive =
      session.inRoom && session.connectionState === "connected" && session.getClassId() !== null;
    if (syncResolution && session.isInstructorRoom && canApplyLive) {
      void session.syncPublishReceiveFromResolution();
    }
    if (canApplyLive) {
      session.scheduleApplyPublishSettings();
    }
  }
</script>

<div class="publish-fields" class:publish-fields--compact={mode === "compact"}>
  {#if session.isInstructorRoom}
    <LiveBrowserMediaHints {session} />
  {/if}
  {#if mode === "prep" && session.isInstructorRoom}
    <p class="publish-fields__hint">{t.live.preConnect.publishPrepHint()}</p>
  {:else if mode === "compact" && session.isInstructorRoom}
    <p class="publish-fields__hint">
      {#if session.publishSettingsApplying}
        מעדכנת איכות שידור…
      {:else if session.activePublishVideoSource === "screen_share"}
        ההגדרות חלות על שיתוף המסך (לא על מצלמה כבויה). שיתוף מחדש אחרי שינוי קודק/ביטרייט.
      {:else}
        שינויים חלים על השידור מיד (המצלמה עשויה להבהב לרגע).
      {/if}
    </p>
  {/if}

  <LivePublishPresets {session} {showPresets} afterChange={afterPublishFieldChange} />

  <LivePublishStackFields {session} afterChange={afterPublishFieldChange} {selectOverlayClass} />

  <LivePublishAdvancedFields {session} {mode} afterChange={afterPublishFieldChange} {selectOverlayClass} />

  {#if showEchoToggle}
    <div class="publish-fields__toggles">
      <span class="hb-switch">
        <Switch.Root
          class="hb-switch__root"
          aria-label={t.live.room.echoCancel()}
          bind:checked={session.audioProcessingEnabled}
        >
          <Switch.Thumb class="hb-switch__thumb" />
        </Switch.Root>
        <span>{t.live.room.echoCancel()}</span>
      </span>
    </div>
  {/if}
</div>

<style>
  .publish-fields {
    display: grid;
    gap: var(--space-3);
    min-width: 0;
    width: 100%;
  }

  .publish-fields--compact {
    gap: var(--space-2);
  }

  .publish-fields__hint {
    margin: 0;
    font-size: var(--step--2);
    line-height: 1.45;
    color: var(--foreground-muted);
  }

  .publish-fields :global(.hb-field--stacked) {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-1);
    align-items: stretch;
    width: 100%;
    min-width: 0;
  }

  .publish-fields :global(.hb-field--stacked .hb-select__trigger) {
    width: 100%;
    min-width: 0;
  }

  .publish-fields :global(.hb-field--stacked .hb-field__label) {
    text-transform: none;
    font-size: var(--step--1);
    font-weight: 700;
    color: var(--foreground);
  }

  .publish-fields__toggles {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2) var(--space-4);
  }
</style>
