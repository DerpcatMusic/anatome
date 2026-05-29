<script lang="ts">
  import { Track, RoomEvent, type RemoteParticipant, type RemoteTrackPublication } from "livekit-client";
  import type { TrackReference } from "@livekit/components-core";
  import { getRoomContext } from "$lib/livekit/contexts/room-context.svelte.js";
  import VideoTrack from "$lib/livekit/components/participant/VideoTrack.svelte";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import {
    isClassHostParticipant,
    subscribeToHostPublications,
  } from "$lib/features/live/live-room-shared";

  let {
    hostUserId = null,
    broadcastHostUserId = null,
    hostDisplayName = "",
    class: className = "",
  }: {
    hostUserId?: string | null;
    broadcastHostUserId?: string | null;
    hostDisplayName?: string;
    class?: string;
  } = $props();

  const room = getRoomContext();
  const { t } = useI18n();

  let roomRevision = $state(0);

  const roomEvents = [
    RoomEvent.ParticipantConnected,
    RoomEvent.ParticipantDisconnected,
    RoomEvent.TrackPublished,
    RoomEvent.TrackUnpublished,
    RoomEvent.TrackSubscribed,
    RoomEvent.TrackUnsubscribed,
    RoomEvent.TrackSubscriptionStatusChanged,
  ] as const;

  $effect(() => {
    const bump = () => {
      roomRevision += 1;
    };
    for (const event of roomEvents) {
      room.on(event, bump);
    }
    return () => {
      for (const event of roomEvents) {
        room.off(event, bump);
      }
    };
  });

  const hostParticipant = $derived.by((): RemoteParticipant | null => {
    roomRevision;
    for (const participant of room.remoteParticipants.values()) {
      if (
        isClassHostParticipant(participant.identity, hostUserId, broadcastHostUserId)
      ) {
        return participant;
      }
    }
    return null;
  });

  $effect(() => {
    roomRevision;
    const host = hostParticipant;
    if (!host) return;
    subscribeToHostPublications(host);
  });

  function trackRefForPublication(
    participant: RemoteParticipant,
    publication: RemoteTrackPublication | undefined,
  ): TrackReference | null {
    if (!publication) return null;
    return {
      participant,
      publication,
      source: publication.source,
    };
  }

  const displayTrackRef = $derived.by((): TrackReference | null => {
    roomRevision;
    const host = hostParticipant;
    if (!host) return null;

    const screen = host.getTrackPublication(Track.Source.ScreenShare) as
      | RemoteTrackPublication
      | undefined;
    const camera = host.getTrackPublication(Track.Source.Camera) as
      | RemoteTrackPublication
      | undefined;

    if (screen?.track) return trackRefForPublication(host, screen);
    if (camera?.track) return trackRefForPublication(host, camera);
    if (screen?.isSubscribed) return trackRefForPublication(host, screen);
    if (camera?.isSubscribed) return trackRefForPublication(host, camera);
    if (screen) return trackRefForPublication(host, screen);
    if (camera) return trackRefForPublication(host, camera);
    return null;
  });

  const hostInRoom = $derived(hostParticipant !== null);
  const hasRenderableVideo = $derived(displayTrackRef?.publication?.track !== undefined);
</script>

<div class="lr-member-stage {className}" data-testid="member-stage">
  {#if hasRenderableVideo && displayTrackRef}
    <div class="lr-member-stage__focus">
      <VideoTrack trackRef={displayTrackRef} class="lr-member-stage__video" />
      {#if displayTrackRef.publication.source === Track.Source.ScreenShare}
        <span class="lr-badge lr-badge--screen">{t.live.room.screenShare()}</span>
      {/if}
    </div>
  {:else if hostInRoom}
    <div class="lr-member-stage__waiting" role="status" aria-live="polite">
      <span class="material-symbols-rounded lr-member-stage__icon" aria-hidden="true">podcasts</span>
      <p class="lr-member-stage__title">
        {hostDisplayName || t.live.room.instructor()}
      </p>
      <p class="lr-member-stage__hint">{t.live.room.waitingForBroadcastStart()}</p>
    </div>
  {:else}
    <div class="lr-member-stage__waiting" role="status" aria-live="polite">
      <span class="material-symbols-rounded lr-member-stage__icon" aria-hidden="true">person</span>
      <p class="lr-member-stage__title">
        {hostDisplayName || t.live.room.instructor()}
      </p>
      <p class="lr-member-stage__hint">
        {hostDisplayName
          ? t.live.room.waitingForInstructorNamed({ instructor: hostDisplayName })
          : t.live.room.waitingForInstructor()}
      </p>
    </div>
  {/if}
</div>

<style>
  .lr-member-stage {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    min-height: 0;
    background: #000;
    z-index: 1;
  }

  .lr-member-stage__focus {
    position: relative;
    flex: 1 1 auto;
    min-height: 0;
    display: flex;
    align-items: stretch;
    justify-content: center;
  }

  .lr-member-stage__video {
    width: 100%;
    height: 100%;
    object-fit: contain;
    background: #000;
  }

  .lr-member-stage__focus .lr-badge {
    position: absolute;
    inset-block-start: var(--space-3);
    inset-inline-start: var(--space-3);
  }

  .lr-member-stage__waiting {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-3);
    padding: var(--space-6);
    text-align: center;
    color: var(--on-dark-muted, rgba(255, 255, 255, 0.72));
  }

  .lr-member-stage__icon {
    font-size: 3rem;
    opacity: 0.5;
  }

  .lr-member-stage__title {
    margin: 0;
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--on-dark, #fff);
  }

  .lr-member-stage__hint {
    margin: 0;
    font-size: var(--text-sm);
    max-width: 28ch;
  }
</style>
