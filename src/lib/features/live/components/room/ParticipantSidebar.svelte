<script lang="ts">
  import { Button } from "bits-ui";
  import { ScrollArea } from "bits-ui";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import type { ParticipantItem } from "$lib/features/live/types";

  let {
    open,
    participants,
    onClose,
  }: {
    open: boolean;
    participants: ParticipantItem[];
    onClose: () => void;
  } = $props();

  const { t } = useI18n();
</script>

{#if open}
  <aside class="lr-panel lr-glass lr-panel--participants" aria-label={t.live.room.participantsTitle()}>
    <div class="lr-panel__header">
      <h3>{t.live.room.participantsTitle()}</h3>
      <button
        type="button"
        class="hb-button hb-button--close"
        onclick={onClose}
        aria-label={t.live.room.close()}
      >
        <span class="material-symbols-rounded">close</span>
      </button>
    </div>
    <ScrollArea.Root class="hb-scroll-area lr-panel__scroll">
  <ScrollArea.Viewport class="hb-scroll-area__viewport">
    <div class="lr-participant-list">
        {#each participants as p (p.identity)}
          <div
            class="lr-participant"
            class:lr-participant--speaking={p.isSpeaking}
            class:lr-participant--instructor={p.isInstructor}
          >
            <div class="lr-participant__left">
              <span class="lr-participant__name">{p.name}</span>
              {#if p.isInstructor}<span class="lr-participant__role">{t.live.room.instructor()}</span>{/if}
              {#if p.isLocal}<span class="lr-participant__role">{t.live.room.you()}</span>{/if}
            </div>
            <div class="lr-participant__indicators">
              <span
                class="lr-indicator"
                class:lr-indicator--on={p.hasMic}
                class:lr-indicator--off={!p.hasMic}
                title={p.hasMic ? t.live.room.micOn() : t.live.room.micOff()}
              >
                <span class="material-symbols-rounded" aria-hidden="true">{p.hasMic ? "mic" : "mic_off"}</span>
              </span>
              <span
                class="lr-indicator"
                class:lr-indicator--on={p.hasCamera}
                class:lr-indicator--off={!p.hasCamera}
                title={p.hasCamera ? t.live.room.cameraOn() : t.live.room.cameraOff()}
              >
                <span class="material-symbols-rounded" aria-hidden="true">{p.hasCamera ? "videocam" : "videocam_off"}</span>
              </span>
            </div>
          </div>
        {/each}
      </div>
  </ScrollArea.Viewport>
  <ScrollArea.Scrollbar class="hb-scroll-area__bar" orientation="vertical">
    <ScrollArea.Thumb class="hb-scroll-area__thumb" />
  </ScrollArea.Scrollbar>
</ScrollArea.Root>
  </aside>
{/if}
