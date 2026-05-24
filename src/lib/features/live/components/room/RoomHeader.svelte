<script lang="ts">
  import { useI18n } from "$lib/i18n/runes.svelte";
  import { Tooltip, Separator } from "bits-ui";
  import LeaveModal from "./LeaveModal.svelte";
  import type { ConnectionQualityLevel, ConnectionState } from "$lib/features/live/types";

  let {
    connectionState,
    connectionLabel,
    connectionQuality,
    connectionQualityLabel,
    showConnectionWarning,
    joinExpiryLabel,
    classTitle,
    participantCount,
    isInstructorRoom,
    showQualityPanel,
    showParticipants,
    onToggleParticipants,
    onToggleQualityPanel,
    onLeave,
    onEndLive,
  }: {
    connectionState: ConnectionState;
    connectionLabel: string;
    connectionQuality: ConnectionQualityLevel;
    connectionQualityLabel: string | null;
    showConnectionWarning: boolean;
    joinExpiryLabel: string | null;
    classTitle: string;
    participantCount: number;
    isInstructorRoom: boolean;
    showQualityPanel: boolean;
    showParticipants: boolean;
    onToggleParticipants: () => void;
    onToggleQualityPanel: () => void;
    onLeave: () => void;
    onEndLive?: () => void;
  } = $props();

  const { t } = useI18n();

  let showLeaveModal = $state(false);

  const qualityIcon = $derived(
    connectionQuality === "excellent" || connectionQuality === "good"
      ? "signal_cellular_alt"
      : connectionQuality === "poor"
        ? "signal_cellular_alt_2_bar"
        : connectionQuality === "lost"
          ? "signal_cellular_off"
          : "network_check",
  );
</script>

<LeaveModal
  {isInstructorRoom}
  bind:open={showLeaveModal}
  {onLeave}
  {onEndLive}
/>

<header class="lr-header lr-glass">
  <div class="lr-header__group">
    <button
      type="button"
      class="lr-header__back"
      onclick={() => { showLeaveModal = true; }}
    >
      <span class="material-symbols-rounded" aria-hidden="true">arrow_forward</span>
      <span>{t.live.room.back()}</span>
    </button>
    <Separator.Root class="lr-header__divider" orientation="vertical" />
    <div class="lr-header__meta">
      {#if classTitle}
        <span class="lr-header__class-title">{classTitle}</span>
      {/if}
      <div class="lr-header__status">
        <span
          class="lr-header__status-dot"
          class:lr-header__status-dot--on={connectionState === "connected"}
          class:lr-header__status-dot--warn={showConnectionWarning}
        ></span>
        <span class="lr-header__status-label">{connectionLabel}</span>
        {#if connectionQualityLabel && connectionState === "connected"}
          <span class="lr-header__quality" class:lr-header__quality--warn={showConnectionWarning}>
            <span class="material-symbols-rounded" aria-hidden="true">{qualityIcon}</span>
            {connectionQualityLabel}
          </span>
        {/if}
      </div>
    </div>
    <Tooltip.Root>
      <Tooltip.Trigger class="hb-tooltip-trigger">
        <button
          type="button"
          class="lr-header__pill"
          onclick={onToggleParticipants}
          aria-label={t.live.room.participantsTitle()}
        >
          <span class="material-symbols-rounded" aria-hidden="true">people</span>
          <span>{participantCount}</span>
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content class="hb-tooltip-content">
          {t.live.room.participantsTitle()}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  </div>

  <div class="lr-header__group">
    {#if joinExpiryLabel}
      <span class="lr-header__expiry">{joinExpiryLabel}</span>
    {/if}
    {#if isInstructorRoom}
      <Tooltip.Root>
        <Tooltip.Trigger class="hb-tooltip-trigger">
          <button
            type="button"
            class="hb-button hb-button--icon"
            class:hb-button--icon-active={showQualityPanel}
            onclick={onToggleQualityPanel}
            aria-label={t.live.stats.title()}
          >
            <span class="material-symbols-rounded" aria-hidden="true">monitoring</span>
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content class="hb-tooltip-content">
            {t.live.stats.title()}
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    {/if}
    <Tooltip.Root>
      <Tooltip.Trigger class="hb-tooltip-trigger">
        <button
          type="button"
          class="hb-button hb-button--icon-danger"
          onclick={() => { showLeaveModal = true; }}
          aria-label={t.live.room.leave()}
        >
          <span class="material-symbols-rounded" aria-hidden="true">logout</span>
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content class="hb-tooltip-content">
          {t.live.room.leave()}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  </div>
</header>

<style>
  .lr-header__meta {
    display: grid;
    gap: 2px;
    min-width: 0;
  }

  .lr-header__class-title {
    font-size: var(--step--1);
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: min(28vw, 220px);
  }

  .lr-header__status {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
  }

  .lr-header__status-dot--warn {
    background: var(--terra);
  }

  .lr-header__quality {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: var(--step--2);
    color: color-mix(in srgb, var(--white) 70%, transparent);
  }

  .lr-header__quality .material-symbols-rounded {
    font-size: 1rem;
  }

  .lr-header__quality--warn {
    color: var(--terra);
  }

  .lr-header__expiry {
    font-size: var(--step--2);
    font-family: var(--font-mono, monospace);
    color: color-mix(in srgb, var(--white) 72%, transparent);
    white-space: nowrap;
  }
</style>
