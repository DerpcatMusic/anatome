export function isInstructorIdentity(identity: string) {
  return identity.startsWith("instructor_") || identity.startsWith("admin_");
}

/** Convex user id embedded in LiveKit identity (`{role}_{userId}`). */
export function userIdFromLiveKitIdentity(identity: string): string | null {
  const separator = identity.indexOf("_");
  if (separator < 0) return null;
  const userId = identity.slice(separator + 1);
  return userId.length > 0 ? userId : null;
}

/** Whether this LiveKit participant is the class host (instructor or broadcast starter). */
/** Member clients: force subscription to all host publications (camera, screen, audio). */
export function subscribeToHostPublications(participant: {
  trackPublications: Map<string, { setSubscribed?: (subscribed: boolean) => void }>;
}): void {
  for (const publication of participant.trackPublications.values()) {
    if (typeof publication.setSubscribed === "function") {
      publication.setSubscribed(true);
    }
  }
}

export function isClassHostParticipant(
  identity: string,
  instructorUserId: string | null | undefined,
  broadcastHostUserId?: string | null,
): boolean {
  if (isInstructorIdentity(identity)) return true;
  const participantUserId = userIdFromLiveKitIdentity(identity);
  if (participantUserId === null) return false;
  if (
    instructorUserId !== null &&
    instructorUserId !== undefined &&
    participantUserId === instructorUserId
  ) {
    return true;
  }
  if (
    broadcastHostUserId !== null &&
    broadcastHostUserId !== undefined &&
    participantUserId === broadcastHostUserId
  ) {
    return true;
  }
  return false;
}
