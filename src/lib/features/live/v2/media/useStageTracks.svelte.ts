import type { TrackReference } from "@livekit/components-core";
import { trackReferencesObservable } from "@livekit/components-core";
import type { Room } from "livekit-client";
import { Track } from "livekit-client";

const STAGE_SOURCES = [Track.Source.Camera, Track.Source.ScreenShare] as const;

/**
 * Camera + screen-share tiles for the v2 stage (official core observable).
 */
export function useStageTracks(getRoom: () => Room | undefined) {
  let trackReferences = $state<TrackReference[]>([]);

  $effect(() => {
    const room = getRoom();
    if (room === undefined) {
      trackReferences = [];
      return;
    }

    const subscription = trackReferencesObservable(room, [...STAGE_SOURCES], {
      onlySubscribed: true,
    }).subscribe(({ trackReferences: next }) => {
      trackReferences = next;
    });

    return () => subscription.unsubscribe();
  });

  return {
    get tracks() {
      return trackReferences;
    },
  };
}
