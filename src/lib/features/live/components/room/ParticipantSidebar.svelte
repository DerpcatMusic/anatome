<script lang="ts">
  import { useI18n } from "$lib/i18n/runes.svelte";
  import type { LiveRoom } from "$lib/features/live/room.svelte";

  let { room }: { room: LiveRoom } = $props();
  const { t } = useI18n();
</script>

{#if room.showParticipants}
  <aside class="participant-sidebar" aria-label={t.live.room.participantsTitle()}>
    <div class="sidebar-header">
      <h3>{t.live.room.participantsTitle()}</h3>
      <button class="sidebar-close" type="button" onclick={() => room.showParticipants = false} aria-label={t.live.room.close()}>
        <span class="material-symbols-rounded">close</span>
      </button>
    </div>
    <div class="sidebar-list">
      {#each room.participants as p (p.identity)}
        <div class="participant-item" class:participant-item--speaking={p.isSpeaking} class:participant-item--instructor={p.isInstructor}>
          <div class="participant-item__left">
            <span class="participant-item__name">{p.name}</span>
            {#if p.isInstructor}<span class="participant-item__role">{t.live.room.instructor()}</span>{/if}
            {#if p.isLocal}<span class="participant-item__role">{t.live.room.you()}</span>{/if}
          </div>
          <div class="participant-item__indicators">
            <span class="indicator" class:indicator--on={p.hasMic} class:indicator--off={!p.hasMic} title={p.hasMic ? t.live.room.micOn() : t.live.room.micOff()}>
              <span class="material-symbols-rounded" aria-hidden="true">{p.hasMic ? "mic" : "mic_off"}</span>
            </span>
            <span class="indicator" class:indicator--on={p.hasCamera} class:indicator--off={!p.hasCamera} title={p.hasCamera ? t.live.room.cameraOn() : t.live.room.cameraOff()}>
              <span class="material-symbols-rounded" aria-hidden="true">{p.hasCamera ? "videocam" : "videocam_off"}</span>
            </span>
          </div>
        </div>
      {/each}
    </div>
  </aside>
{/if}

<style>
  @import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,500,0,0");

  .participant-sidebar {
    width: 260px;
    background: var(--white);
    border-inline-start: var(--border);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-3) var(--space-4);
    border-bottom: var(--border);
    min-height: 48px;
  }

  .sidebar-header h3 {
    margin: 0;
    font-size: var(--step-0);
    font-weight: 700;
  }

  .sidebar-close {
    width: 28px;
    height: 28px;
    display: inline-grid;
    place-items: center;
    background: transparent;
    border: var(--border);
    color: var(--ink);
    cursor: pointer;
    padding: 0;
    border-radius: 0;
  }
  .sidebar-close:hover { background: var(--surface); }

  .sidebar-list {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-2);
  }

  .participant-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border-bottom: 1px solid var(--line-light);
    transition: background var(--duration-fast);
  }

  .participant-item--speaking {
    background: #e8f5ee;
  }

  .participant-item--instructor {
    border-inline-end: 3px solid var(--ink);
  }

  .participant-item__left {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    min-width: 0;
  }

  .participant-item__name {
    font-weight: 700;
    font-size: var(--step--1);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .participant-item__role {
    font-family: var(--font-mono);
    font-size: var(--step--2);
    background: var(--surface);
    padding: 2px 6px;
    border: var(--border);
    flex-shrink: 0;
  }

  .participant-item__indicators {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    flex-shrink: 0;
  }

  .indicator {
    width: 24px;
    height: 24px;
    display: inline-grid;
    place-items: center;
  }

  .indicator .material-symbols-rounded {
    font-size: 18px;
  }

  .indicator--on { color: var(--ink); }
  .indicator--off { color: var(--line-light); }

  .material-symbols-rounded {
    width: 1.5rem;
    height: 1.5rem;
    display: block;
    overflow: hidden;
    font-family: "Material Symbols Rounded";
    font-weight: normal;
    font-style: normal;
    font-size: 1.5rem;
    line-height: 1;
    letter-spacing: 0;
    text-transform: none;
    white-space: nowrap;
    word-wrap: normal;
    direction: ltr;
    font-feature-settings: "liga";
    -webkit-font-feature-settings: "liga";
    -webkit-font-smoothing: antialiased;
  }

  @media (max-width: 48rem) {
    .participant-sidebar {
      position: absolute;
      inset-inline: 0;
      inset-block-end: 0;
      width: auto;
      height: 60%;
      border-inline-start: none;
      border-top: var(--border);
      z-index: 15;
      box-shadow: 0 -4px 20px rgba(0,0,0,0.1);
    }
  }
</style>
