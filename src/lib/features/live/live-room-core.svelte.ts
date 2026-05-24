import type { ConvexClient } from "convex/browser";
import type { Id } from "$convex/_generated/dataModel";
import { initAuth } from "$lib/auth/session.svelte";
import type { LiveClassType, ParticipantRole, RoomStatus } from "./types";
import { isInstructorIdentity } from "./live-room-shared";

/** Auth, join metadata, and room lifecycle status shared across layers. */
export class LiveRoomCore {
  readonly client: ConvexClient;
  auth = initAuth();

  status = $state<RoomStatus>("checking");
  error = $state("");
  mediaError = $state("");
  joinInfo = $state<{
    wsUrl: string;
    token: string;
    roomName: string;
    participantRole: ParticipantRole;
    joinClosesAt: number;
    classTitle: string;
    instructorName: string;
    liveClassType: LiveClassType;
  } | null>(null);
  joinAccess = $state<{
    joinOpensAt: number;
    joinClosesAt: number;
    startsAt: number;
    status: "draft" | "scheduled" | "live" | "ended" | "cancelled";
    canEnter: boolean;
    minutesUntilOpen: number | null;
    minutesUntilClose: number | null;
    isInstructor: boolean;
  } | null>(null);

  constructor(client: ConvexClient) {
    this.client = client;
  }

  getClassId() {
    const classId = new URLSearchParams(window.location.search).get("classId");
    return classId as Id<"liveClasses"> | null;
  }

  isInstructorIdentity(identity: string) {
    return isInstructorIdentity(identity);
  }

  dismissMediaError() {
    this.mediaError = "";
  }
}
