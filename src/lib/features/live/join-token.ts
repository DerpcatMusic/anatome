/**
 * Convex join access + deferred JWT minting.
 *
 * Pre-connect: `fetchJoinAccessSnapshot` / reactive `getJoinContext` only.
 * Connect: `issueJoinCredentials` mints JWT via `api.livekit.token.issueJoin`.
 */
import { api } from "$convex/_generated/api";
import type { ConvexClient } from "convex/browser";
import type { Id } from "$convex/_generated/dataModel";
import { getCachedRole } from "$lib/auth/session.svelte";
import { hasLiveClassIdParam, parseLiveClassId } from "$lib/convex/ids";
import { assertIssueJoinMatchesClass } from "$lib/live/join-guard";
import { isEquipmentJoinError, i18n } from "./live-room-shared";
import type { RoomStatus } from "./types";

/** Mirrors reference `useToken` phases; `token` means JWT is minted and ready to connect. */
export type JoinTokenPhase = "idle" | "loading" | "error" | "token";

export type JoinInfo = {
  wsUrl: string;
  token: string;
  roomName: string;
  liveClassId?: Id<"liveClasses">;
  participantRole: import("./types").ParticipantRole;
  joinClosesAt: number;
  classTitle: string;
  instructorName: string;
  liveClassType: import("./types").LiveClassType;
};

export type JoinAccessSnapshot = {
  joinOpensAt: number;
  joinClosesAt: number;
  startsAt: number;
  status: "draft" | "scheduled" | "live" | "ended" | "cancelled";
  canEnter: boolean;
  minutesUntilOpen: number | null;
  minutesUntilClose: number | null;
  isInstructor: boolean;
  equipmentBlocked: boolean;
  isBroadcastLive: boolean;
  broadcastStartedByUserId?: import("$convex/_generated/dataModel").Id<"users">;
  subscriberReceivePreset: "low" | "medium" | "high";
};

export type JoinContextSnapshot = JoinAccessSnapshot & {
  classTitle: string;
};

/** Value equality for join access (avoids `$state` proxy `!==` mismatches). */
export function joinAccessSnapshotsEqual(
  a: JoinAccessSnapshot | null,
  b: JoinAccessSnapshot | null,
): boolean {
  if (a === null && b === null) return true;
  if (a === null || b === null) return false;
  return (
    a.joinOpensAt === b.joinOpensAt &&
    a.joinClosesAt === b.joinClosesAt &&
    a.startsAt === b.startsAt &&
    a.status === b.status &&
    a.canEnter === b.canEnter &&
    a.minutesUntilOpen === b.minutesUntilOpen &&
    a.minutesUntilClose === b.minutesUntilClose &&
    a.isInstructor === b.isInstructor &&
    a.equipmentBlocked === b.equipmentBlocked &&
    a.isBroadcastLive === b.isBroadcastLive &&
    a.broadcastStartedByUserId === b.broadcastStartedByUserId &&
    a.subscriberReceivePreset === b.subscriberReceivePreset
  );
}

/** Value equality for minted JWT join payloads. */
export function joinInfoEqual(a: JoinInfo | null, b: JoinInfo | null): boolean {
  if (a === null && b === null) return true;
  if (a === null || b === null) return false;
  return a.token === b.token && a.roomName === b.roomName;
}

export type JoinTokenSnapshot = {
  phase: JoinTokenPhase;
  status: RoomStatus;
  error: string;
  joinInfo: JoinInfo | null;
  joinAccess: JoinAccessSnapshot | null;
  /** Display title from `getJoinContext` when JWT is not minted yet. */
  classTitle: string | null;
};

export type FetchJoinTokenInput = {
  client: ConvexClient;
  isAuthenticated: boolean;
  authError?: string;
  classIdFromUrl: string | null;
  now: number;
};

function resolveClassId(raw: string | null): Id<"liveClasses"> | null {
  if (!hasLiveClassIdParam(raw)) return null;
  return parseLiveClassId(raw);
}

function mapAccessToStatus(
  access: JoinAccessSnapshot,
): { status: RoomStatus; error: string; phase: JoinTokenPhase } {
  if (access.equipmentBlocked) {
    return { status: "equipment", error: "", phase: "error" };
  }
  if (!access.canEnter) {
    if (access.minutesUntilOpen !== null) {
      return { status: "waiting", error: "", phase: "error" };
    }
    if (!access.isInstructor && access.status === "scheduled") {
      return { status: "waiting", error: "", phase: "error" };
    }
    const error =
      access.status === "ended" || access.status === "cancelled"
        ? i18n.t.live.room.disconnectRoomEnded()
        : i18n.t.live.room.joinTooEarlyBody();
    return { status: "error", error, phase: "error" };
  }
  const hostMustStartBroadcast =
    access.isInstructor &&
    (access.status === "scheduled" ||
      (access.status === "live" && !access.isBroadcastLive));
  const status: RoomStatus = hostMustStartBroadcast ? "prep" : "ready";
  return { status, error: "", phase: "idle" };
}

/** Access-only preflight (no JWT). */
export async function fetchJoinAccessSnapshot(
  input: FetchJoinTokenInput,
): Promise<JoinTokenSnapshot> {
  const { client, isAuthenticated, authError, classIdFromUrl, now } = input;

  if (!isAuthenticated) {
    return {
      phase: "error",
      status: "locked",
      error: authError ?? "",
      joinInfo: null,
      joinAccess: null,
      classTitle: null,
    };
  }

  if (hasLiveClassIdParam(classIdFromUrl) && resolveClassId(classIdFromUrl) === null) {
    return {
      phase: "error",
      status: "invalidClass",
      error: "",
      joinInfo: null,
      joinAccess: null,
      classTitle: null,
    };
  }

  const liveClassId = resolveClassId(classIdFromUrl);
  if (liveClassId === null) {
    return {
      phase: "error",
      status: "missing",
      error: "",
      joinInfo: null,
      joinAccess: null,
      classTitle: null,
    };
  }

  try {
    const context = await client.query(api.live.session.getJoinContext, {
      liveClassId,
      now,
    });

    if (context === null) {
      return {
        phase: "error",
        status: "missing",
        error: "",
        joinInfo: null,
        joinAccess: null,
        classTitle: null,
      };
    }

    const { classTitle, ...access } = context;
    const mapped = mapAccessToStatus(access);
    return {
      phase: mapped.phase,
      status: mapped.status,
      error: mapped.error,
      joinInfo: null,
      joinAccess: access,
      classTitle,
    };
  } catch (reason) {
    return mapJoinAccessError(reason, isAuthenticated, authError);
  }
}

function mapJoinAccessError(
  reason: unknown,
  isAuthenticated: boolean,
  authError?: string,
): JoinTokenSnapshot {
  if (!isAuthenticated) {
    return {
      phase: "error",
      status: "locked",
      error: authError ?? "",
      joinInfo: null,
      joinAccess: null,
      classTitle: null,
    };
  }

  const message = reason instanceof Error ? reason.message : String(reason);

  if (
    message.includes("ההצטרפות תיפתח") ||
    message.includes("מחוץ לחלון") ||
    message.includes("join window")
  ) {
    return {
      phase: "error",
      status: "waiting",
      error: "",
      joinInfo: null,
      joinAccess: null,
      classTitle: null,
    };
  }

  if (message.includes("Class is not live") || message.includes("השיעור אינו חי")) {
    const role = getCachedRole();
    if (role === "instructor" || role === "admin") {
      return {
        phase: "error",
        status: "prep",
        error: "",
        joinInfo: null,
        joinAccess: null,
        classTitle: null,
      };
    }
  }

  if (isEquipmentJoinError(message)) {
    return {
      phase: "error",
      status: "equipment",
      error: "",
      joinInfo: null,
      joinAccess: null,
      classTitle: null,
    };
  }

  return {
    phase: "error",
    status: "error",
    error: authError || message || i18n.t.live.room.tokenError(),
    joinInfo: null,
    joinAccess: null,
    classTitle: null,
  };
}

/** Mint JWT — call only when connecting or refreshing an active session. */
export async function issueJoinCredentials(
  client: ConvexClient,
  liveClassId: Id<"liveClasses">,
): Promise<JoinInfo> {
  const joinInfo = await client.action(api.livekit.token.issueJoin, { liveClassId });
  assertIssueJoinMatchesClass(liveClassId, joinInfo);
  return joinInfo;
}

/**
 * @deprecated Pre-connect path — access only. Use {@link issueJoinCredentials} on connect.
 */
export async function fetchJoinToken(input: FetchJoinTokenInput): Promise<JoinTokenSnapshot> {
  return fetchJoinAccessSnapshot(input);
}

/** Map reactive `getJoinContext` data to a join snapshot (no JWT). */
export function joinSnapshotFromContext(
  context: JoinContextSnapshot | null | undefined,
  options: {
    isLoading: boolean;
    isAuthenticated: boolean;
    authError?: string;
    /** URL or dock pinned a class id (distinct from “no class selected”). */
    hasClassId?: boolean;
  },
): JoinTokenSnapshot {
  if (options.isLoading) {
    return {
      phase: "loading",
      status: "checking",
      error: "",
      joinInfo: null,
      joinAccess: null,
      classTitle: null,
    };
  }

  if (!options.isAuthenticated) {
    return {
      phase: "error",
      status: "locked",
      error: options.authError ?? "",
      joinInfo: null,
      joinAccess: null,
      classTitle: null,
    };
  }

  if (context === null || context === undefined) {
    const noAccess = options.hasClassId === true && context === null;
    return {
      phase: "error",
      status: noAccess ? "invalidClass" : "missing",
      error: "",
      joinInfo: null,
      joinAccess: null,
      classTitle: null,
    };
  }

  const { classTitle, ...access } = context;
  const mapped = mapAccessToStatus(access);
  return {
    phase: mapped.phase,
    status: mapped.status,
    error: mapped.error,
    joinInfo: null,
    joinAccess: access,
    classTitle,
  };
}
