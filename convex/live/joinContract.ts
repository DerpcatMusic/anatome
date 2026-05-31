import { v } from "convex/values";
import type { Infer } from "convex/values";
import {
  liveClassStatusValidator,
  liveClassTypeValidator,
  profileRoleValidator,
  subscriberReceivePresetValidator,
} from "../lib/domainValidators";

/** Client-visible role from `issueJoin` / LiveKit identity prefix. */
export const liveParticipantRoleValidator = profileRoleValidator;

export type LiveParticipantRole = Infer<typeof liveParticipantRoleValidator>;

export const liveRoomClassTypeValidator = liveClassTypeValidator;

export type LiveRoomClassType = Infer<typeof liveRoomClassTypeValidator>;

/** Output of `internal.live.room.prepareJoin` (not exposed to clients). */
export const prepareJoinResultValidator = v.object({
  userId: v.id("users"),
  displayName: v.string(),
  roomName: v.string(),
  participantRole: liveParticipantRoleValidator,
  liveClassId: v.id("liveClasses"),
  liveClassType: liveRoomClassTypeValidator,
  classTitle: v.string(),
  instructorName: v.string(),
  instructorUserId: v.id("users"),
  startsAt: v.number(),
  endsAt: v.number(),
  joinClosesAt: v.number(),
  capacity: v.number(),
  maxParticipants: v.number(),
});

export type PrepareJoinResult = Infer<typeof prepareJoinResultValidator>;

/**
 * Stable client contract for `api.livekit.token.issueJoin`.
 * Do not rename or remove fields without updating the live session client (`live-session.svelte.ts`).
 */
export const issueJoinResultValidator = v.object({
  wsUrl: v.string(),
  token: v.string(),
  roomName: v.string(),
  liveClassId: v.id("liveClasses"),
  participantRole: liveParticipantRoleValidator,
  joinClosesAt: v.number(),
  classTitle: v.string(),
  instructorName: v.string(),
  instructorUserId: v.id("users"),
  liveClassType: liveRoomClassTypeValidator,
});

export type IssueJoinResult = Infer<typeof issueJoinResultValidator>;

/** Output of `api.live.class.getJoinAccess`. */
export const joinAccessSnapshotValidator = v.object({
  joinOpensAt: v.number(),
  joinClosesAt: v.number(),
  startsAt: v.number(),
  status: liveClassStatusValidator,
  canEnter: v.boolean(),
  minutesUntilOpen: v.union(v.number(), v.null()),
  minutesUntilClose: v.union(v.number(), v.null()),
  isInstructor: v.boolean(),
  equipmentBlocked: v.boolean(),
  isBroadcastLive: v.boolean(),
  broadcastStartedByUserId: v.optional(v.id("users")),
  instructorUserId: v.id("users"),
  instructorName: v.string(),
  subscriberReceivePreset: subscriberReceivePresetValidator,
});

export type JoinAccessSnapshot = Infer<typeof joinAccessSnapshotValidator>;

/** Output of `api.live.session.getJoinContext` (access + display title). */
export const joinContextValidator = v.union(
  v.null(),
  v.object({
    ...joinAccessSnapshotValidator.fields,
    classTitle: v.string(),
  }),
);

export type JoinContext = Infer<typeof joinContextValidator>;
