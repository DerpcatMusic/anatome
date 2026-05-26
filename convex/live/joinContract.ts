import { v } from "convex/values";
import type { Infer } from "convex/values";

/** Client-visible role from `issueJoin` / LiveKit identity prefix. */
export const liveParticipantRoleValidator = v.union(
  v.literal("instructor"),
  v.literal("customer"),
  v.literal("admin"),
);

export type LiveParticipantRole = Infer<typeof liveParticipantRoleValidator>;

export const liveRoomClassTypeValidator = v.union(
  v.literal("group_live"),
  v.literal("one_on_one"),
);

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
  startsAt: v.number(),
  endsAt: v.number(),
  joinClosesAt: v.number(),
  capacity: v.number(),
  maxParticipants: v.number(),
});

export type PrepareJoinResult = Infer<typeof prepareJoinResultValidator>;

/**
 * Stable client contract for `api.livekit.token.issueJoin`.
 * Do not rename or remove fields without updating `room.svelte.ts` (or split client).
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
  liveClassType: liveRoomClassTypeValidator,
});

export type IssueJoinResult = Infer<typeof issueJoinResultValidator>;
