import type { ConvexClient } from "convex/browser";
import type { Id } from "$convex/_generated/dataModel";
import { parseLiveClassId } from "$lib/convex/ids";
import { initAuth } from "$lib/auth/session.svelte";
import type { JoinAccessSnapshot, JoinInfo, JoinTokenPhase } from "./join-token";
import type { RoomStatus } from "./types";
import { isInstructorIdentity } from "./live-room-shared";

/** Auth, join metadata, and session lifecycle status. */
export class LiveSessionCore {
  readonly client: ConvexClient;
  auth = initAuth();

  status = $state<RoomStatus>("checking");
  error = $state("");
  mediaError = $state("");
  /** Reference `useToken` phase for Convex join credentials. */
  joinTokenPhase = $state<JoinTokenPhase>("idle");
  joinInfo = $state<JoinInfo | null>(null);
  joinAccess = $state<JoinAccessSnapshot | null>(null);
  /** Title from `getJoinContext` before JWT is minted. */
  joinContextTitle = $state<string | null>(null);

  /** Set by LiveRoomShell — Convex join token refetch (reference `useToken` reload). */
  refetchJoinToken: (() => Promise<void>) | null = null;

  /** Pinned while instructor PiP or dock holds an active class (URL may not have classId). */
  pinnedClassId = $state<Id<"liveClasses"> | null>(null);

  /** Instructor leave-without-end: navigate in-app (PiP) instead of tearing down WebRTC. */
  onInstructorLeaveInApp: (() => void) | null = null;

  constructor(client: ConvexClient) {
    this.client = client;
  }

  getClassId(): Id<"liveClasses"> | null {
    if (this.pinnedClassId !== null) return this.pinnedClassId;
    if (typeof window === "undefined") return null;
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
