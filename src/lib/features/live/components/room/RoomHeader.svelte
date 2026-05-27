<script lang="ts">
  import { useI18n } from "$lib/i18n/runes.svelte";
  import { Button, Tooltip } from "bits-ui";
  import LeaveModal from "./LeaveModal.svelte";
  import type { ConnectionQualityLevel, ConnectionState } from "$lib/features/live/types";
  import type { LiveSessionHeader } from "$lib/features/live/live-session.svelte";

  let {
    session,
    connectionState: connectionStateProp,
    connectionLabel: connectionLabelProp,
    connectionQuality: connectionQualityProp,
    connectionQualityLabel: connectionQualityLabelProp,
    showConnectionWarning: showConnectionWarningProp,
    joinExpiryLabel: joinExpiryLabelProp,
    classTitle: classTitleProp,
    participantCount,
    isInstructorRoom: isInstructorRoomProp,
    onLeave: onLeaveProp,
    onEndLive: onEndLiveProp,
  }: {
    session?: LiveSessionHeader;
    connectionState?: ConnectionState;
    connectionLabel?: string;
    connectionQuality?: ConnectionQualityLevel;
    connectionQualityLabel?: string | null;
    showConnectionWarning?: boolean;
    joinExpiryLabel?: string | null;
    classTitle?: string;
    participantCount: number;
    isInstructorRoom?: boolean;
    onLeave?: () => void;
    onEndLive?: () => void;
  } = $props();

  const connectionState = $derived(session?.connectionState ?? connectionStateProp!);
  const connectionLabel = $derived(session?.connectionLabel ?? connectionLabelProp!);
  const connectionQuality = $derived(session?.connectionQuality ?? connectionQualityProp!);
  const connectionQualityLabel = $derived(
    session?.connectionQualityLabel ?? connectionQualityLabelProp ?? null,
  );
  const showConnectionWarning = $derived(
    session?.showConnectionWarning ?? showConnectionWarningProp!,
  );
  const joinExpiryLabel = $derived(session?.joinExpiryLabel ?? joinExpiryLabelProp ?? null);
  const classTitle = $derived(session?.classTitle ?? classTitleProp ?? "");
  const isInstructorRoom = $derived(session?.isInstructorRoom ?? isInstructorRoomProp!);
  const onLeave = $derived.by(() => (session ? () => session.leave() : onLeaveProp!));
  const onEndLive = $derived.by(() =>
    session
      ? session.isInstructorRoom
        ? () => void session.endLive?.()
        : undefined
      : onEndLiveProp,
  );

  const { t } = useI18n();

  let showLeaveModal = $state(false);

  const showQualityDetail = $derived(
    connectionState === "connected" &&
      Boolean(connectionQualityLabel) &&
      (showConnectionWarning ||
        connectionQuality === "poor" ||
        connectionQuality === "lost" ||
        connectionQuality === "unknown"),
  );

  const qualityIcon = $derived(
    connectionQuality === "excellent" || connectionQuality === "good"
      ? "signal_cellular_alt"
      : connectionQuality === "poor"
        ? "signal_cellular_alt_2_bar"
        : connectionQuality === "lost"
          ? "signal_cellular_off"
          : "network_check",
  );

  function openLeaveModal() {
    showLeaveModal = true;
  }
</script>

<LeaveModal
  {isInstructorRoom}
  bind:open={showLeaveModal}
  onLeave={onLeave}
  onEndLive={onEndLive}
/>

<header class="lr-header">
  <div class="lr-header__start">
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
        {#if showQualityDetail && connectionQualityLabel}
          <span class="lr-header__quality" class:lr-header__quality--warn={showConnectionWarning}>
            <span class="material-symbols-rounded" aria-hidden="true">{qualityIcon}</span>
            {connectionQualityLabel}
          </span>
        {/if}
      </div>
    </div>

    {#if session?.classBroadcastLabel}
      <span
        class="lr-header__broadcast"
        class:lr-header__broadcast--live={session.classBroadcastStatus === "live"}
        role="status"
      >
        {#if session.classBroadcastStatus === "live"}
          <span class="lr-header__broadcast-dot" aria-hidden="true"></span>
        {/if}
        {session.classBroadcastLabel}
      </span>
    {/if}

    <span class="lr-header__participant-pill" aria-label={t.live.room.participantsTitle()}>
      <span class="material-symbols-rounded" aria-hidden="true">groups</span>
      {participantCount}
    </span>
  </div>

  <div class="lr-header__end">
    {#if joinExpiryLabel && !isInstructorRoom}
      <span class="lr-header__expiry">{joinExpiryLabel}</span>
    {/if}

    <Tooltip.Root>
      <Tooltip.Trigger>
        {#snippet child({ props })}
          <Button.Root
            {...props}
            class="lr-header-btn lr-header-btn--danger"
            type="button"
            onclick={openLeaveModal}
            aria-label={t.live.room.leave()}
          >
            <span class="material-symbols-rounded" aria-hidden="true">logout</span>
          </Button.Root>
        {/snippet}
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content class="hb-tooltip-content lr-tooltip-content">
          {t.live.room.leave()}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  </div>
</header>
