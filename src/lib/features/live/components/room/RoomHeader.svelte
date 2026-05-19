<script lang="ts">
  import { routePath } from "$lib/i18n/context";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import type { LiveRoom } from "$lib/features/live/room.svelte";

  let { room }: { room: LiveRoom } = $props();
  const { t } = useI18n();

  const backHref = $derived(
    room.isInstructorRoom ? routePath("studioLive") : routePath("customerCalendar")
  );
</script>

<header class="room-header">
  <div class="header-left">
    <a href={backHref} class="header-back">
      <span class="material-symbols-rounded" aria-hidden="true">arrow_forward</span>
      <span>{t.live.room.back()}</span>
    </a>
    <div class="header-divider"></div>
    <div class="header-status">
      <span class="status-dot" class:on={room.connectionState === "connected"}></span>
      <span class="status-label">{room.connectionLabel}</span>
    </div>
    <button class="header-participants-btn" type="button" onclick={() => room.showParticipants = !room.showParticipants}>
      <span class="material-symbols-rounded" aria-hidden="true">people</span>
      <span>{room.participants.length}</span>
    </button>
  </div>
  <div class="header-right">
    {#if room.isInstructorRoom}
      <button class="header-icon-btn" type="button" onclick={() => room.showQualityPanel = !room.showQualityPanel} aria-label={t.live.stats.title()} title={t.live.stats.title()}>
        <span class="material-symbols-rounded" aria-hidden="true">monitoring</span>
      </button>
    {/if}
    <a class="header-icon-btn leave" href={backHref} aria-label={t.live.room.leave()} title={t.live.room.leave()}>
      <span class="material-symbols-rounded" aria-hidden="true">logout</span>
    </a>
  </div>
</header>

<style>
  @import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,500,0,0");

  .room-header {
    grid-area: header;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    padding: var(--space-2) var(--space-3);
    background: var(--white);
    border-bottom: var(--border);
    z-index: 10;
    min-height: 48px;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .header-back {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    font-size: var(--step--1);
    font-weight: 700;
    color: var(--muted);
    text-decoration: none;
    transition: color var(--duration-fast);
  }
  .header-back:hover { color: var(--ink); }

  .header-divider {
    width: 1px;
    height: 20px;
    background: var(--line-light);
  }

  .header-status {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--line-light);
    flex-shrink: 0;
  }
  .status-dot.on { background: #188038; }

  .status-label {
    font-family: var(--font-mono);
    font-size: var(--step--2);
    color: var(--muted);
  }

  .header-participants-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    background: var(--surface);
    border: var(--border);
    padding: var(--space-1) var(--space-2);
    font-family: var(--font-mono);
    font-size: var(--step--2);
    color: var(--ink);
    cursor: pointer;
    border-radius: 0;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .header-icon-btn {
    width: 36px;
    height: 36px;
    display: inline-grid;
    place-items: center;
    background: var(--surface);
    border: var(--border);
    color: var(--ink);
    cursor: pointer;
    padding: 0;
    text-decoration: none;
    border-radius: 0;
    transition: background var(--duration-fast);
  }
  .header-icon-btn:hover { background: var(--line-light); }

  .header-icon-btn.leave {
    background: #fff1f0;
    border-color: #c93322;
    color: #c93322;
  }
  .header-icon-btn.leave:hover { background: #fde8e7; }

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
    .header-participants-btn {
      display: inline-flex;
    }
  }

  @media (min-width: 48.01rem) {
    .header-participants-btn {
      display: none;
    }
  }
</style>
