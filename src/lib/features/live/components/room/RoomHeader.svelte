<script lang="ts">
  import { useI18n } from "$lib/i18n/runes.svelte";
  import Tooltip from "$components/ui/Tooltip.svelte";
  import LeaveModal from "./LeaveModal.svelte";
  import type { ConnectionState } from "$lib/features/live/types";

  let {
    connectionState,
    connectionLabel,
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
    <div class="lr-header__divider"></div>
    <div class="lr-header__status">
      <span class="lr-header__status-dot" class:lr-header__status-dot--on={connectionState === "connected"}></span>
      <span class="lr-header__status-label">{connectionLabel}</span>
    </div>
    <Tooltip label={t.live.room.participantsTitle()}>
      <button
        type="button"
        class="lr-header__pill"
        onclick={onToggleParticipants}
        aria-label={t.live.room.participantsTitle()}
      >
        <span class="material-symbols-rounded" aria-hidden="true">people</span>
        <span>{participantCount}</span>
      </button>
    </Tooltip>
  </div>

  <div class="lr-header__group">
    {#if isInstructorRoom}
      <Tooltip label={t.live.stats.title()}>
        <button
          type="button"
          class="hb-button hb-button--icon"
          onclick={onToggleQualityPanel}
          aria-label={t.live.stats.title()}
        >
          <span class="material-symbols-rounded" aria-hidden="true">monitoring</span>
        </button>
      </Tooltip>
    {/if}
    <Tooltip label={t.live.room.leave()}>
      <button
        type="button"
        class="hb-button hb-button--icon-danger"
        onclick={() => { showLeaveModal = true; }}
        aria-label={t.live.room.leave()}
      >
        <span class="material-symbols-rounded" aria-hidden="true">logout</span>
      </button>
    </Tooltip>
  </div>
</header>
