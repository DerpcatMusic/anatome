import type {
  SourcesArray,
  TrackReference,
  TrackReferenceOrPlaceholder,
  TrackReferencePlaceholder,
} from "@livekit/components-core";
import {
  isSourcesWithOptions,
  isSourceWitOptions,
  log,
  trackReferencesObservable,
} from "@livekit/components-core";
import { Track, RoomEvent, type Participant, type Room } from "livekit-client";
import { roomCtx } from "../contexts/room-context.svelte.js";

/** @public */
export type UseTracksOptions = {
  updateOnlyOn?: RoomEvent[];
  onlySubscribed?: boolean;
  room?: Room;
  /** Prefer over `room` when the room reference comes from a Svelte prop. */
  getRoom?: () => Room | undefined;
};

/** @public */
export type UseTracksHookReturnType<T> = T extends Track.Source[]
  ? TrackReference[]
  : T extends { source: Track.Source; withPlaceholder: boolean }[]
    ? TrackReferenceOrPlaceholder[]
    : never;

function difference<T>(setA: Set<T>, setB: Set<T>): Set<T> {
  const diff = new Set(setA);
  for (const elem of setB) {
    diff.delete(elem);
  }
  return diff;
}

export function requiredPlaceholders<T extends SourcesArray>(
  sources: T,
  participants: Participant[],
): Map<Participant["identity"], Track.Source[]> {
  const placeholderMap = new Map<Participant["identity"], Track.Source[]>();
  if (isSourcesWithOptions(sources)) {
    const sourcesThatNeedPlaceholder = sources
      .filter((sourceWithOption) => sourceWithOption.withPlaceholder)
      .map((sourceWithOption) => sourceWithOption.source);

    participants.forEach((participant) => {
      const sourcesOfSubscribedTracks = participant
        .getTrackPublications()
        .map((pub) => pub.track?.source)
        .filter((trackSource): trackSource is Track.Source => trackSource !== undefined);
      const placeholderNeededForThisParticipant = Array.from(
        difference(new Set(sourcesThatNeedPlaceholder), new Set(sourcesOfSubscribedTracks)),
      );
      if (placeholderNeededForThisParticipant.length > 0) {
        placeholderMap.set(participant.identity, placeholderNeededForThisParticipant);
      }
    });
  }
  return placeholderMap;
}

function buildTrackReferences<T extends SourcesArray>(
  sources: T,
  room: Room | null,
  trackReferences: TrackReference[],
  participants: Participant[],
): TrackReference[] | TrackReferenceOrPlaceholder[] {
  if (!room) {
    return [] as TrackReference[] | TrackReferenceOrPlaceholder[];
  }
  if (isSourcesWithOptions(sources)) {
    const requirePlaceholder = requiredPlaceholders(sources, participants);
    const trackReferencesWithPlaceholders: TrackReferenceOrPlaceholder[] = Array.from(trackReferences);
    participants.forEach((participant) => {
      if (requirePlaceholder.has(participant.identity)) {
        const sourcesToAddPlaceholder = requirePlaceholder.get(participant.identity) ?? [];
        sourcesToAddPlaceholder.forEach((placeholderSource) => {
          if (
            trackReferences.find(
              ({ participant: p, publication }) =>
                participant.identity === p.identity && publication.source === placeholderSource,
            )
          ) {
            return;
          }
          log.debug(
            `Add ${placeholderSource} placeholder for participant ${participant.identity}.`,
          );
          const placeholder: TrackReferencePlaceholder = {
            participant,
            source: placeholderSource,
          };
          trackReferencesWithPlaceholders.push(placeholder);
        });
      }
    });
    return trackReferencesWithPlaceholders;
  }
  return trackReferences;
}

/**
 * Subscribe to track references for the given sources.
 * Supports placeholders when sources include `{ source, withPlaceholder: true }` objects.
 *
 * @public
 */
export function useTracks<T extends SourcesArray = Track.Source[]>(
  sources: T = [
    Track.Source.Camera,
    Track.Source.Microphone,
    Track.Source.ScreenShare,
    Track.Source.ScreenShareAudio,
    Track.Source.Unknown,
  ] as T,
  options: UseTracksOptions = {},
): UseTracksHookReturnType<T> {
  let trackReferences = $state<TrackReference[]>([]);
  let participants = $state<Participant[]>([]);
  let tracksRevision = $state(0);
  let outputTracks = $state<TrackReference[] | TrackReferenceOrPlaceholder[]>([]);

  const sources_ = $derived(
    sources.map((s) => (isSourceWitOptions(s) ? s.source : s)),
  );

  /** Force Svelte to refresh when LiveKit mutates publications in place. */
  $effect(() => {
    const r = options.getRoom?.() ?? options.room ?? roomCtx.getOr(undefined) ?? null;
    if (!r) return;
    const bump = () => {
      tracksRevision += 1;
    };
    const bumpEvents = [
      RoomEvent.LocalTrackPublished,
      RoomEvent.LocalTrackUnpublished,
      RoomEvent.TrackPublished,
      RoomEvent.TrackUnpublished,
      RoomEvent.TrackSubscribed,
      RoomEvent.TrackUnsubscribed,
      RoomEvent.TrackSubscriptionStatusChanged,
      RoomEvent.ParticipantConnected,
      RoomEvent.ParticipantDisconnected,
      RoomEvent.ConnectionStateChanged,
      RoomEvent.ActiveSpeakersChanged,
    ] as const;
    for (const event of bumpEvents) {
      r.on(event, bump);
    }
    return () => {
      for (const event of bumpEvents) {
        r.off(event, bump);
      }
    };
  });

  $effect(() => {
    const r = options.getRoom?.() ?? options.room ?? roomCtx.getOr(undefined) ?? null;
    if (!r) {
      trackReferences = [];
      participants = [];
      return;
    }
    tracksRevision;
    let active = true;
    const subscription = trackReferencesObservable(r, sources_, {
      additionalRoomEvents: options.updateOnlyOn,
      onlySubscribed: options.onlySubscribed,
    }).subscribe(({ trackReferences: nextRefs, participants: nextParticipants }) => {
      if (!active) return;
      log.debug("setting track bundles", nextRefs, nextParticipants);
      trackReferences = [...nextRefs];
      participants = [...nextParticipants];
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  });

  $effect(() => {
    const r = options.getRoom?.() ?? options.room ?? roomCtx.getOr(undefined) ?? null;
    trackReferences;
    participants;
    tracksRevision;
    outputTracks = buildTrackReferences(sources, r, trackReferences, participants);
  });

  // svelte-ignore state_referenced_locally
  return outputTracks as UseTracksHookReturnType<T>;
}
