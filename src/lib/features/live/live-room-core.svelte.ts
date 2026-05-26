import type { ConvexClient } from "convex/browser";
import type { Id } from "$convex/_generated/dataModel";
import { parseLiveClassId } from "$lib/convex/ids";
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
    liveClassId?: Id<"liveClasses">;
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
    equipmentBlocked: boolean;
  } | null>(null);

  constructor(client: ConvexClient) {
    this.client = client;
  }

  getClassId(): Id<"liveClasses"> | null {
    const raw = new URLSearchParams(window.location.search).get("classId");
    return parseLiveClassId(raw);
  }

  isInstructorIdentity(identity: string) {
    return isInstructorIdentity(identity);
  }

  dismissMediaError() {
    this.mediaError = "";
  }
}
