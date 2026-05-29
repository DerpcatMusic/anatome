<script lang="ts">
  import type { Participant } from "livekit-client";
  import { useIsSpeaking, useParticipantMedia } from "$lib/livekit";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import RosterMemberIdentity from "./RosterMemberIdentity.svelte";

  let {
    displayName,
    avatarUrl = null,
    reservationStatus,
    participant,
  }: {
    displayName: string;
    avatarUrl?: string | null;
    reservationStatus: "reserved" | "joined";
    participant: Participant;
  } = $props();

  const { t } = useI18n();

  const isSpeaking = useIsSpeaking(() => participant);
  const media = useParticipantMedia(() => participant);

  const hasJoined = $derived(reservationStatus === "joined");
  const hasCamera = $derived(media.isCameraEnabled);
  const hasMic = $derived(media.isMicrophoneEnabled);
</script>

<div
  class="lr-participant lr-participant--roster"
  class:lr-participant--speaking={isSpeaking}
  class:lr-participant--roster-joined={hasJoined}
  class:lr-participant--roster-reserved={!hasJoined}
>
  <div class="lr-participant__left">
    <RosterMemberIdentity {displayName} {avatarUrl} size={28} />
    <span
      class="lr-participant__role lr-participant__role--roster"
      class:lr-participant__role--joined={hasJoined}
    >
      <span class="material-symbols-rounded" aria-hidden="true">
        {hasJoined ? "check_circle" : "event_seat"}
      </span>
      {hasJoined ? "בשידור" : "שמורה"}
    </span>
  </div>
  <div class="lr-participant__indicators">
    <span
      class="lr-indicator"
      class:lr-indicator--on={hasMic}
      class:lr-indicator--off={!hasMic}
      title={hasMic ? t.live.room.micOn() : t.live.room.micOff()}
    >
      <span class="material-symbols-rounded" aria-hidden="true">{hasMic ? "mic" : "mic_off"}</span>
    </span>
    <span
      class="lr-indicator"
      class:lr-indicator--on={hasCamera}
      class:lr-indicator--off={!hasCamera}
      title={hasCamera ? t.live.room.cameraOn() : t.live.room.cameraOff()}
    >
      <span class="material-symbols-rounded" aria-hidden="true"
        >{hasCamera ? "videocam" : "videocam_off"}</span
      >
    </span>
  </div>
</div>
