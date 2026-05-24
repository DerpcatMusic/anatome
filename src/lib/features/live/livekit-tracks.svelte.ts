import { trackReferencesObservable, type TrackReference } from "@livekit/components-core";
import { Track, type Room } from "livekit-client";
import type { MediaSource } from "./types";

/** Video tile for VideoStage — backed by components-core track references */
export type StageTrackTile = {
  id: string;
  identity: string;
  name: string;
  element: HTMLElement;
  kind: "video";
  source: MediaSource;
  isLocal: boolean;
  isInstructor: boolean;
};

export type LiveKitStageTracksOptions = {
  getRoom: () => Room | null;
  isInstructorIdentity: (identity: string) => boolean;
};

const STAGE_SOURCES = [Track.Source.Camera, Track.Source.ScreenShare] as const;

function publicationId(ref: TrackReference): string {
  const pub = ref.publication;
  const track = pub.track;
  return pub.trackSid ?? track?.sid ?? track?.mediaStreamTrack?.id ?? String(ref.source);
}

function trackRefId(ref: TrackReference): string {
  return `${ref.participant.identity}_${ref.source}_${publicationId(ref)}`;
}

function mapTrackSource(source: Track.Source): MediaSource {
  switch (source) {
    case Track.Source.Camera:
      return "camera";
    case Track.Source.Microphone:
      return "microphone";
    case Track.Source.ScreenShare:
      return "screen_share";
    case Track.Source.ScreenShareAudio:
      return "screen_share_audio";
    default:
      return "unknown";
  }
}

function participantDisplayName(ref: TrackReference): string {
  return ref.participant.name || ref.participant.identity;
}

export function stageTileSort(a: StageTrackTile, b: StageTrackTile): number {
  if (a.source === "screen_share" && b.source !== "screen_share") return -1;
  if (a.source !== "screen_share" && b.source === "screen_share") return 1;
  if (a.isLocal !== b.isLocal) return Number(a.isLocal) - Number(b.isLocal);
  return a.name.localeCompare(b.name);
}

function configureVideoElement(element: HTMLElement, source: MediaSource, isLocal: boolean) {
  element.setAttribute("playsinline", "true");
  element.setAttribute("data-source", source);
  if (element instanceof HTMLMediaElement) {
    element.muted = isLocal;
  }
}

function trackRefToTile(
  ref: TrackReference,
  elementById: Map<string, HTMLElement>,
  isInstructorIdentity: (identity: string) => boolean,
): StageTrackTile | null {
  const track = ref.publication.track;
  if (!track || ref.publication.kind !== Track.Kind.Video) return null;

  const id = trackRefId(ref);
  const source = mapTrackSource(ref.source);
  const isLocal = ref.participant.isLocal;
  let element = elementById.get(id);

  if (!element) {
    element = track.attach();
    configureVideoElement(element, source, isLocal);
    elementById.set(id, element);
  }

  const identity = ref.participant.identity;
  return {
    id,
    identity,
    name: participantDisplayName(ref),
    element,
    kind: "video",
    source,
    isLocal,
    isInstructor: isInstructorIdentity(identity),
  };
}

function releaseStaleElements(elementById: Map<string, HTMLElement>, activeIds: Set<string>) {
  for (const [id, element] of elementById) {
    if (activeIds.has(id)) continue;
    element.remove();
    elementById.delete(id);
  }
}

function clearElements(elementById: Map<string, HTMLElement>) {
  for (const element of elementById.values()) {
    element.remove();
  }
  elementById.clear();
}

/**
 * Reactive stage tracks via `@livekit/components-core` `trackReferencesObservable`.
 * Subscribe in the shell; pass derived tiles into `VideoStage`.
 */
export function createLiveKitStageTracks(options: LiveKitStageTracksOptions) {
  const elementById = new Map<string, HTMLElement>();
  let trackReferences = $state<TrackReference[]>([]);

  $effect(() => {
    const room = options.getRoom();
    if (!room) {
      trackReferences = [];
      clearElements(elementById);
      return;
    }

    const subscription = trackReferencesObservable(room, [...STAGE_SOURCES], {
      onlySubscribed: true,
    }).subscribe(({ trackReferences: next }) => {
      trackReferences = next;
    });

    return () => {
      subscription.unsubscribe();
      trackReferences = [];
      clearElements(elementById);
    };
  });

  const videoTiles = $derived.by(() => {
    const activeIds = new Set<string>();
    const tiles: StageTrackTile[] = [];

    for (const ref of trackReferences) {
      const tile = trackRefToTile(ref, elementById, options.isInstructorIdentity);
      if (!tile) continue;
      activeIds.add(tile.id);
      tiles.push(tile);
    }

    releaseStaleElements(elementById, activeIds);
    return tiles.sort(stageTileSort);
  });

  const screenShareTiles = $derived(
    videoTiles.filter((tile) => tile.source === "screen_share"),
  );

  const hasScreenShare = $derived(screenShareTiles.length > 0);

  const primaryInstructorVideo = $derived.by(() => {
    if (screenShareTiles.length > 0) return screenShareTiles[0];
    const instructors = videoTiles
      .filter((tile) => tile.isInstructor && tile.source !== "screen_share")
      .sort(stageTileSort);
    return instructors.find((tile) => !tile.isLocal) ?? instructors[0] ?? null;
  });

  const selfVideo = $derived(
    videoTiles.find((tile) => tile.isLocal && tile.source !== "screen_share") ?? null,
  );

  return {
    videoTiles,
    screenShareTiles,
    hasScreenShare,
    primaryInstructorVideo,
    selfVideo,
    tileSort: stageTileSort,
  };
}

/** Mount a stage tile without destroying its element (hook owns lifecycle). */
export function mountStageTrack(node: HTMLElement, tile: StageTrackTile) {
  let current = tile.element;
  node.replaceChildren(current);
  return {
    update(next: StageTrackTile) {
      if (next.element !== current) {
        current = next.element;
        node.replaceChildren(current);
      }
    },
    destroy() {
      node.replaceChildren();
    },
  };
}
