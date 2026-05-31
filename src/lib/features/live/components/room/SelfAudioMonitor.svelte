<script lang="ts">
  import { Track } from "livekit-client";
  import type { Room } from "livekit-client";
  import type { LiveSessionSelfAudio } from "$lib/features/live/live-session.svelte";

  let {
    session,
    liveKitRoom,
    room: liveKitRoomAlias,
    enabled: enabledProp,
  }: {
    session?: LiveSessionSelfAudio;
    liveKitRoom?: Room | null;
    /** @deprecated Use `liveKitRoom` or `session`. */
    room?: Room | null;
    enabled?: boolean;
  } = $props();

  const lkRoom = $derived(
    session?.liveKitRoom ?? liveKitRoom ?? liveKitRoomAlias ?? null,
  );
  const enabled = $derived(enabledProp ?? session?.selfAudioMonitorEnabled ?? false);

  let audioEl: HTMLAudioElement | null = null;

  $effect(() => {
    if (!enabled || !lkRoom) return;
    const track = lkRoom.localParticipant.getTrackPublication(Track.Source.Microphone)?.track;
    if (track && audioEl) {
      track.attach(audioEl);
    }
    return () => {
      if (track && audioEl) {
        track.detach(audioEl);
      }
    };
  });
</script>

{#if enabled}
  <audio bind:this={audioEl} autoplay muted={false} aria-hidden="true"></audio>
{/if}
