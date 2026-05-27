<script lang="ts">
  import { useIsSpeaking, useParticipantMedia } from "$lib/livekit";
  import { isInstructorIdentity } from "$lib/features/live/live-room-shared";
  import type { Participant } from "livekit-client";
  import { useI18n } from "$lib/i18n/runes.svelte";

  let {
    participant,
  }: {
    participant: Participant;
  } = $props();

  const { t } = useI18n();

  const isSpeaking = useIsSpeaking(participant);
  const media = useParticipantMedia(participant);

  const name = $derived(participant.name || participant.identity);
  const isInstructor = $derived(isInstructorIdentity(participant.identity));
  const hasCamera = $derived(media.isCameraEnabled);
  const hasMic = $derived(media.isMicrophoneEnabled);
</script>

<div
  class="lr-participant"
  class:lr-participant--speaking={isSpeaking}
  class:lr-participant--instructor={isInstructor}
>
  <div class="lr-participant__left">
    <span class="lr-participant__name">{name}</span>
    {#if isInstructor}<span class="lr-participant__role">{t.live.room.instructor()}</span>{/if}
    {#if participant.isLocal}<span class="lr-participant__role">{t.live.room.you()}</span>{/if}
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
      <span class="material-symbols-rounded" aria-hidden="true">{hasCamera ? "videocam" : "videocam_off"}</span>
    </span>
  </div>
</div>
