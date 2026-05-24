<script lang="ts">
  import { useI18n } from "$lib/i18n/runes.svelte";
  import { Button, Separator, Tooltip } from "bits-ui";
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

<header class="lr-header">
  <div class="lr-header__start">
    <Button.Root
      class="hb-button hb-button--paper hb-button--sm lr-header__back"
      type="button"
      onclick={() => {
        showLeaveModal = true;
      }}
    >
      <span class="material-symbols-rounded" aria-hidden="true">arrow_forward</span>
      <span class="lr-header__back-label">{t.live.room.back()}</span>
    </Button.Root>

    <Separator.Root class="lr-header__divider" orientation="vertical" />

    <div class="lr-header__meta">
      {#if classTitle}
        <span class="lr-header__class-title" title={classTitle}>{classTitle}</span>
      {/if}
      <div class="lr-header__status">
        <span
          class="lr-header__status-dot"
          class:lr-header__status-dot--on={connectionState === "connected"}
          class:lr-header__status-dot--warn={showConnectionWarning}
          aria-hidden="true"
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

    <span
      class="lr-header__role-badge"
      class:lr-header__role-badge--instructor={isInstructorRoom}
      role="status"
    >
      {isInstructorRoom ? t.live.room.instructor() : t.live.room.participantRole()}
    </span>

    <Tooltip.Root>
      <Tooltip.Trigger class="hb-tooltip-trigger">
        <Button.Root
          class="hb-button hb-button--participants {showParticipants ? 'hb-button--control-participants-on' : ''}"
          type="button"
          onclick={onToggleParticipants}
          aria-label={t.live.room.participantsTitle()}
          aria-pressed={showParticipants}
        >
          <span class="material-symbols-rounded" aria-hidden="true">people</span>
          <span class="lr-header__participant-count">{participantCount}</span>
        </Button.Root>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content class="hb-tooltip-content">
          {showParticipants ? t.live.room.hideParticipants() : t.live.room.showParticipants()}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  </div>

  <div class="lr-header__end">
    {#if joinExpiryLabel}
      <span class="lr-header__expiry">{joinExpiryLabel}</span>
    {/if}
    {#if isInstructorRoom}
      <Tooltip.Root>
        <Tooltip.Trigger class="hb-tooltip-trigger">
          <Button.Root
            class="hb-button hb-button--icon {showQualityPanel ? 'hb-button--icon-active' : ''}"
            type="button"
            onclick={onToggleQualityPanel}
            aria-label={t.live.stats.title()}
            aria-pressed={showQualityPanel}
          >
            <span class="material-symbols-rounded" aria-hidden="true">monitoring</span>
          </Button.Root>
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
        <Button.Root
          class="hb-button hb-button--icon-danger"
          type="button"
          onclick={() => {
            showLeaveModal = true;
          }}
          aria-label={t.live.room.leave()}
        >
          <span class="material-symbols-rounded" aria-hidden="true">logout</span>
        </Button.Root>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content class="hb-tooltip-content">
          {t.live.room.leave()}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  </div>
</header>
