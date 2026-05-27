import {
  isInstructorIdentity,
  participantIdentity,
  participantIsLocal,
} from "../../live-room-shared";

export type SubscribePolicy = {
  isInstructorRoom: boolean;
};

function shouldSubscribe(policy: SubscribePolicy, participant: unknown): boolean {
  if (policy.isInstructorRoom) return true;
  return isInstructorIdentity(participantIdentity(participant));
}

function targetVideoQuality(participant: unknown): 0 | 1 | 2 {
  return isInstructorIdentity(participantIdentity(participant)) ? 2 : 0;
}

export function applySubscribePolicy(
  policy: SubscribePolicy,
  publication: unknown,
  participant: unknown,
) {
  const pub = publication as {
    setSubscribed?: (subscribed: boolean) => void;
    setVideoQuality?: (quality: number) => void;
    kind?: string;
  };
  if (typeof pub.setSubscribed !== "function") return;
  if (participantIsLocal(participant)) return;

  const subscribed = shouldSubscribe(policy, participant);
  pub.setSubscribed(subscribed);
  if (subscribed && pub.kind === "video" && typeof pub.setVideoQuality === "function") {
    pub.setVideoQuality(targetVideoQuality(participant));
  }
}

export function wireRoomSubscribePolicy(room: import("livekit-client").Room, policy: SubscribePolicy) {
  const onParticipant = (participant: unknown) => {
    const pubs = (participant as { trackPublications?: Map<string, unknown> }).trackPublications;
    pubs?.forEach((publication) => applySubscribePolicy(policy, publication, participant));
  };

  room.remoteParticipants.forEach((participant) => onParticipant(participant));

  room.on("participantConnected", onParticipant);
  room.on("trackPublished", (publication, participant) => {
    applySubscribePolicy(policy, publication, participant);
  });
}
