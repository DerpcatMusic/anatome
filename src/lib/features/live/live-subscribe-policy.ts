import type { JoinAccessSnapshot } from "./join-token";
import { isClassHostParticipant } from "./live-identity";

export { shouldApplySimulcastQuality } from "./live-track-source";
import type {
  SubscriberVideoQuality,
  VideoResolutionChoice,
} from "./types";
import { resolutionToSubscribeLayer, subscriberPresetToQuality } from "./types";

export type SessionSubscribePolicy = {
  isInstructorRoom: boolean;
  instructorUserId: string | null;
  broadcastHostUserId: string | null;
  /** Simulcast layer the instructor publishes at (from prep presets). */
  instructorPublishLayer: SubscriberVideoQuality;
  /** Simulcast layer customers use when watching the instructor. */
  instructorReceiveLayer: SubscriberVideoQuality;
};

export function buildSessionSubscribePolicy(input: {
  isInstructorRoom: boolean;
  selectedResolution: VideoResolutionChoice;
  joinAccess: JoinAccessSnapshot | null;
  instructorUserId?: string | null;
}): SessionSubscribePolicy {
  const publishLayer = resolutionToSubscribeLayer(input.selectedResolution);
  const hostLayerFromClass = input.joinAccess
    ? subscriberPresetToQuality(input.joinAccess.subscriberReceivePreset ?? "medium")
    : publishLayer;

  return {
    isInstructorRoom: input.isInstructorRoom,
    instructorUserId: input.instructorUserId ?? null,
    broadcastHostUserId: input.joinAccess?.broadcastStartedByUserId ?? null,
    instructorPublishLayer: input.isInstructorRoom ? publishLayer : hostLayerFromClass,
    instructorReceiveLayer: input.isInstructorRoom ? publishLayer : hostLayerFromClass,
  };
}

export function shouldSubscribeToRemoteParticipant(
  policy: SessionSubscribePolicy,
  identity: string,
): boolean {
  if (policy.isInstructorRoom) return true;
  return isClassHostParticipant(
    identity,
    policy.instructorUserId,
    policy.broadcastHostUserId,
  );
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
  const remoteIsInstructor = shouldSubscribeToRemoteParticipant(policy, identity);

  if (policy.isInstructorRoom) {
    if (remoteIsInstructor) return policy.instructorPublishLayer;
    return layerOneBelow(policy.instructorPublishLayer);
  }

  if (remoteIsInstructor) return policy.instructorReceiveLayer;
  return 0;
}
