import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import type { MutationCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import { requireAppProfile, requireUserId } from "../lib/authz";
import { prepareJoinResultValidator } from "./joinContract";
import type { LiveParticipantRole } from "./joinContract";
import {
  requireWalletForMember,
  availableLiveCredits,
  availableOneOnOneCredits,
  reserveCredits,
  type LiveCreditPool,
} from "../credits/lib";
import { reserveClassSeat } from "./capacity";
import { roomNameForClass } from "../lib/live";
import {
  getAppProfile,
  maxLiveKitParticipants,
  validateBaseJoinEligibility,
  validateCustomerJoinEligibility,
} from "./joinPolicy";

type JoinContext = {
  ctx: MutationCtx;
  userId: Id<"users">;
  profile: Doc<"appProfiles">;
  liveClass: Doc<"liveClasses">;
  now: number;
};

/** Handles walk-in join: capacity check, credit reservation, reservation creation. */
async function handleWalkIn({ ctx, userId, liveClass, now }: JoinContext) {
  const { wallet } = await requireWalletForMember(ctx, userId);
  const creditKind: LiveCreditPool =
    liveClass.creditKind === "live" ? "live" : "oneOnOne";
  const available =
    creditKind === "live"
      ? availableLiveCredits(wallet)
      : availableOneOnOneCredits(wallet);
  if (available < liveClass.creditCost) {
    throw new Error("אין מספיק נקודות");
  }

  await reserveCredits(ctx, wallet._id, creditKind, liveClass.creditCost);

  await ctx.db.insert("liveReservations", {
    liveClassId: liveClass._id,
    userId,
    walletId: wallet._id,
    status: "reserved",
    creditKind: liveClass.creditKind,
    creditsReserved: liveClass.creditCost,
    reservedAt: now,
  });

  await reserveClassSeat(ctx, liveClass._id);
}

/** Creates a live room record if one does not already exist. */
async function ensureRoomExists(
  { ctx, userId, liveClass, now }: JoinContext,
  isInstructor: boolean,
): Promise<Doc<"liveRooms">> {
  const rooms = await ctx.db
    .query("liveRooms")
    .withIndex("by_liveClassId", (q) => q.eq("liveClassId", liveClass._id))
    .take(1);
  let room: Doc<"liveRooms"> | null = rooms[0] ?? null;

  if (room === null) {
    const newRoom = {
      liveClassId: liveClass._id,
      provider: "livekit" as const,
      roomName: roomNameForClass(liveClass._id),
      status: "active" as const,
      startedAt: now,
      updatedAt: now,
    };
    const roomId = await ctx.db.insert(
      "liveRooms",
      isInstructor ? { ...newRoom, startedByUserId: userId } : newRoom,
    );
    room = await ctx.db.get(roomId);
  }

  if (room === null) throw new Error("Room creation failed");
  return room;
}

/** Logs the join event for audit/debugging. */
async function logJoinEvent(
  { ctx, userId, liveClass, now }: JoinContext,
  participantRole: LiveParticipantRole,
  reason: string,
) {
  await ctx.db.insert("liveJoinEvents", {
    liveClassId: liveClass._id,
    userId,
    role: participantRole,
    result: "allowed",
    reason,
    createdAt: now,
  });
}

export const prepareJoin = internalMutation({
  args: {
    liveClassId: v.id("liveClasses"),
  },
  returns: prepareJoinResultValidator,
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const profile = await requireAppProfile(ctx, userId);
    const liveClass = await ctx.db.get(args.liveClassId);
    const now = Date.now();

    if (liveClass === null) throw new Error("השיעור לא נמצא");
    if (liveClass.type !== "group_live" && liveClass.type !== "one_on_one") {
      throw new Error("LiveKit זמין רק לשיעורים חיים");
    }

    const joinCtx: JoinContext = { ctx, userId, profile, liveClass, now };
    const { isInstructor, participantRole } = await validateBaseJoinEligibility(joinCtx);

    let joinReason = "join_token_issued";

    if (!isInstructor) {
      const reservation = await validateCustomerJoinEligibility(joinCtx);

      if (reservation !== null && reservation.status === "joined") {
        joinReason = "rejoin_token_issued";
      } else if (reservation !== null && reservation.status === "reserved") {
        joinReason = "reserved_token_issued";
      } else if (reservation === null) {
        await handleWalkIn(joinCtx);
        joinReason = "mid_live_walk_in";
      } else {
        throw new Error("נדרשת הרשמה מראש");
      }
    }

    const room = await ensureRoomExists(joinCtx, isInstructor);
    await logJoinEvent(joinCtx, participantRole, joinReason);

    const instructorProfile = await getAppProfile(ctx, liveClass.instructorUserId);

    return {
      userId,
      displayName: profile.displayName,
      roomName: room.roomName,
      participantRole,
      liveClassId: liveClass._id,
      liveClassType: liveClass.type,
      classTitle: liveClass.title,
      instructorName: instructorProfile?.displayName ?? "המדריכה",
      startsAt: liveClass.startsAt,
      endsAt: liveClass.endsAt,
      joinClosesAt: liveClass.joinClosesAt,
      capacity: liveClass.capacity,
      maxParticipants: maxLiveKitParticipants(liveClass.capacity),
    };
  },
});
