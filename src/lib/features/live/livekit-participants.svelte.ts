import {
  connectedParticipantsObserver,
  createIsSpeakingObserver,
  observeParticipantMedia,
  type ParticipantMedia,
} from "@livekit/components-core";
import type { Participant, Room } from "livekit-client";
import type { ParticipantItem } from "./types";

export type LiveKitParticipantsOptions = {
  getRoom: () => Room | null;
  isInstructorIdentity: (identity: string) => boolean;
};

type ParticipantSnapshot = {
  identity: string;
  name: string;
  isLocal: boolean;
  isSpeaking: boolean;
  hasCamera: boolean;
  hasMic: boolean;
};

function mediaToSnapshot(media: ParticipantMedia): Pick<ParticipantSnapshot, "hasCamera" | "hasMic"> {
  return {
    hasCamera: Boolean(media.cameraTrack?.track),
    hasMic: Boolean(media.microphoneTrack?.track),
  };
}

function baseSnapshot(participant: Participant): ParticipantSnapshot {
  return {
    identity: participant.identity,
    name: participant.name || participant.identity,
    isLocal: participant.isLocal,
    isSpeaking: Boolean(participant.isSpeaking),
    hasCamera: false,
    hasMic: false,
  };
}

function toParticipantItem(
  snapshot: ParticipantSnapshot,
  isInstructorIdentity: (identity: string) => boolean,
): ParticipantItem {
  return {
    identity: snapshot.identity,
    name: snapshot.name,
    isInstructor: isInstructorIdentity(snapshot.identity),
    isLocal: snapshot.isLocal,
    isSpeaking: snapshot.isSpeaking,
    hasCamera: snapshot.hasCamera,
    hasMic: snapshot.hasMic,
  };
}

function sortParticipants(items: ParticipantItem[]): ParticipantItem[] {
  return [...items].sort(
    (a, b) => Number(b.isInstructor) - Number(a.isInstructor) || a.name.localeCompare(b.name),
  );
}

/**
 * Participant list for the sidebar via `connectedParticipantsObserver` + local participant.
 * Per-participant media/speaking updates use `observeParticipantMedia` / `createIsSpeakingObserver`.
 */
export function createLiveKitParticipants(options: LiveKitParticipantsOptions) {
  let snapshots = $state<Record<string, ParticipantSnapshot>>({});

  $effect(() => {
    const room = options.getRoom();
    if (!room) {
      snapshots = {};
      return;
    }

    const participantSubs = new Map<string, Array<{ unsubscribe: () => void }>>();

    const patchSnapshot = (identity: string, patch: Partial<ParticipantSnapshot>) => {
      const previous = snapshots[identity] ?? { identity, name: identity, isLocal: false, isSpeaking: false, hasCamera: false, hasMic: false };
      snapshots = {
        ...snapshots,
        [identity]: { ...previous, ...patch },
      };
    };

    const unbindParticipant = (identity: string) => {
      for (const sub of participantSubs.get(identity) ?? []) {
        sub.unsubscribe();
      }
      participantSubs.delete(identity);
      if (!(identity in snapshots)) return;
      const { [identity]: _removed, ...rest } = snapshots;
      snapshots = rest;
    };

    const bindParticipant = (participant: Participant) => {
      const { identity } = participant;
      if (participantSubs.has(identity)) return;

      patchSnapshot(identity, baseSnapshot(participant));

      const subs = [
        observeParticipantMedia(participant).subscribe((media) => {
          patchSnapshot(identity, mediaToSnapshot(media));
        }),
        createIsSpeakingObserver(participant).subscribe((isSpeaking) => {
          patchSnapshot(identity, { isSpeaking });
        }),
      ];
      participantSubs.set(identity, subs);
    };

    const syncParticipants = (remotes: Participant[]) => {
      const activeIds = new Set(remotes.map((p) => p.identity));
      activeIds.add(room.localParticipant.identity);

      for (const identity of participantSubs.keys()) {
        if (!activeIds.has(identity)) unbindParticipant(identity);
      }

      bindParticipant(room.localParticipant);
      for (const remote of remotes) {
        bindParticipant(remote);
      }
    };

    bindParticipant(room.localParticipant);

    const connectedSub = connectedParticipantsObserver(room).subscribe((remotes) => {
      syncParticipants(remotes);
    });

    return () => {
      connectedSub.unsubscribe();
      for (const identity of [...participantSubs.keys()]) {
        unbindParticipant(identity);
      }
      snapshots = {};
    };
  });

  const participants = $derived.by(() => {
    const items = Object.values(snapshots).map((snapshot) =>
      toParticipantItem(snapshot, options.isInstructorIdentity),
    );
    return sortParticipants(items);
  });

  const list = $state({ participants: [] as ParticipantItem[] });

  $effect(() => {
    list.participants = participants;
  });

  return list;
}
