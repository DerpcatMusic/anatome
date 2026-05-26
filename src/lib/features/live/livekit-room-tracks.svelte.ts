import {
  activeSpeakerObserver,
  trackReferencesObservable,
  type TrackReference,
} from "@livekit/components-core";
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

export type AudioSinkTile = {
  id: string;
  element: HTMLElement;
};

export type LiveKitRoomTracksOptions = {
  getRoom: () => Room | null;
  isInstructorIdentity: (identity: string) => boolean;
};

const STAGE_VIDEO_SOURCES = [Track.Source.Camera, Track.Source.ScreenShare] as const;
const AUDIO_SOURCES = [Track.Source.Microphone, Track.Source.ScreenShareAudio] as const;

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

function trackRefToVideoTile(
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

function trackRefToAudioTile(
  ref: TrackReference,
  elementById: Map<string, HTMLElement>,
): AudioSinkTile | null {
  const track = ref.publication.track;
  if (!track || ref.publication.kind !== Track.Kind.Audio) return null;

  const id = trackRefId(ref);
  let element = elementById.get(id);
  if (!element) {
    element = track.attach();
    if (element instanceof HTMLMediaElement) {
      element.muted = false;
    }
    elementById.set(id, element);
  }

  return { id, element };
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

function tilesFromRefs(
  refs: TrackReference[],
  elementById: Map<string, HTMLElement>,
  isInstructorIdentity: (identity: string) => boolean,
): StageTrackTile[] {
  const activeIds = new Set<string>();
  const tiles: StageTrackTile[] = [];

  for (const ref of refs) {
    const tile = trackRefToVideoTile(ref, elementById, isInstructorIdentity);
    if (!tile) continue;
    activeIds.add(tile.id);
    tiles.push(tile);
  }

  releaseStaleElements(elementById, activeIds);
  return tiles.sort(stageTileSort);
}

function audioFromRefs(
  refs: TrackReference[],
  elementById: Map<string, HTMLElement>,
): AudioSinkTile[] {
  const activeIds = new Set<string>();
  const tiles: AudioSinkTile[] = [];

  for (const ref of refs) {
    if (ref.participant.isLocal) continue;
    const tile = trackRefToAudioTile(ref, elementById);
    if (!tile) continue;
    activeIds.add(tile.id);
    tiles.push(tile);
  }

  releaseStaleElements(elementById, activeIds);
  return tiles;
}

/**
 * LiveKit stage + audio sink driven by `@livekit/components-core` observables.
 * Keeps Homebody `lr-*` visuals while delegating track lifecycle to the official core.
 */
export function createLiveKitRoomTracks(options: LiveKitRoomTracksOptions) {
  const videoElementById = new Map<string, HTMLElement>();
  const audioElementById = new Map<string, HTMLElement>();
  let videoRefs = $state<TrackReference[]>([]);
  let audioRefs = $state<TrackReference[]>([]);
  let activeSpeakerIdentity = $state<string | null>(null);

  $effect(() => {
    const room = options.getRoom();
    if (!room) {
      videoRefs = [];
      audioRefs = [];
      activeSpeakerIdentity = null;
      clearElements(videoElementById);
      clearElements(audioElementById);
      return;
    }

    const videoSub = trackReferencesObservable(room, [...STAGE_VIDEO_SOURCES], {
      onlySubscribed: true,
    }).subscribe(({ trackReferences: next }) => {
      videoRefs = next;
    });

    const audioSub = trackReferencesObservable(room, [...AUDIO_SOURCES], {
      onlySubscribed: true,
    }).subscribe(({ trackReferences: next }) => {
      audioRefs = next;
    });

    const speakerSub = activeSpeakerObserver(room).subscribe((speakers) => {
      activeSpeakerIdentity =
        speakers.find((participant) => participant.isSpeaking)?.identity ?? null;
    });

    return () => {
      videoSub.unsubscribe();
      audioSub.unsubscribe();
      speakerSub.unsubscribe();
      videoRefs = [];
      audioRefs = [];
      activeSpeakerIdentity = null;
      clearElements(videoElementById);
      clearElements(audioElementById);
    };
  });

  const videoTiles = $derived.by(() =>
    tilesFromRefs(videoRefs, videoElementById, options.isInstructorIdentity),
  );

  const audioTiles = $derived.by(() => audioFromRefs(audioRefs, audioElementById));

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

  const tracks = $state({
    videoTiles: [] as StageTrackTile[],
    audioTiles: [] as AudioSinkTile[],
    screenShareTiles: [] as StageTrackTile[],
    hasScreenShare: false,
    primaryInstructorVideo: null as StageTrackTile | null,
    selfVideo: null as StageTrackTile | null,
    activeSpeakerIdentity: null as string | null,
    tileSort: stageTileSort,
  });

  $effect(() => {
    tracks.videoTiles = videoTiles;
    tracks.audioTiles = audioTiles;
    tracks.screenShareTiles = screenShareTiles;
    tracks.hasScreenShare = hasScreenShare;
    tracks.primaryInstructorVideo = primaryInstructorVideo;
    tracks.selfVideo = selfVideo;
    tracks.activeSpeakerIdentity = activeSpeakerIdentity;
  });

  return tracks;
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

/** Mount remote/local audio elements for playback (not shown in UI). */
export function mountAudioSink(node: HTMLElement, tile: AudioSinkTile) {
  let current = tile.element;
  node.replaceChildren(current);
  return {
    update(next: AudioSinkTile) {
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

/** @deprecated Use `createLiveKitRoomTracks` */
export const createLiveKitStageTracks = createLiveKitRoomTracks;
