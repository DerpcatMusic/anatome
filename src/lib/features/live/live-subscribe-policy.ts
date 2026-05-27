import type { JoinAccessSnapshot } from "./join-token";
import { isInstructorIdentity } from "./live-room-shared";
import type {
  SubscriberVideoQuality,
  VideoResolutionChoice,
} from "./types";
import { resolutionToSubscribeLayer, subscriberPresetToQuality } from "./types";

export type SessionSubscribePolicy = {
  isInstructorRoom: boolean;
  /** Simulcast layer the instructor publishes at (from prep presets). */
  instructorPublishLayer: SubscriberVideoQuality;
  /** Simulcast layer customers use when watching the instructor. */
  instructorReceiveLayer: SubscriberVideoQuality;
};

export function buildSessionSubscribePolicy(input: {
  isInstructorRoom: boolean;
  selectedResolution: VideoResolutionChoice;
  joinAccess: JoinAccessSnapshot | null;
}): SessionSubscribePolicy {
  const publishLayer = resolutionToSubscribeLayer(input.selectedResolution);
  const hostLayerFromClass = input.joinAccess
    ? subscriberPresetToQuality(input.joinAccess.subscriberReceivePreset ?? "medium")
    : publishLayer;

  return {
    isInstructorRoom: input.isInstructorRoom,
    instructorPublishLayer: input.isInstructorRoom ? publishLayer : hostLayerFromClass,
    instructorReceiveLayer: input.isInstructorRoom ? publishLayer : hostLayerFromClass,
  };
}

function layerOneBelow(layer: SubscriberVideoQuality): SubscriberVideoQuality {
  return Math.max(0, layer - 1) as SubscriberVideoQuality;
}

/**
 * Remote camera simulcast layer for a participant.
 * - Customers → instructor: instructor's chosen publish layer (preset).
 * - Customers → customers: always LOW (360p).
 * - Instructor → customers: one layer below instructor publish.
 */
export function remoteVideoQualityForParticipant(
  policy: SessionSubscribePolicy,
  identity: string,
): SubscriberVideoQuality {
  const remoteIsInstructor = isInstructorIdentity(identity);

  if (policy.isInstructorRoom) {
    if (remoteIsInstructor) return policy.instructorPublishLayer;
    return layerOneBelow(policy.instructorPublishLayer);
  }

  if (remoteIsInstructor) return policy.instructorReceiveLayer;
  return 0;
}
