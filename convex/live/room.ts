import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import type { MutationCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import { requireAppProfile, requireUserId } from "../lib/authz";
import {
  getCurrentCreditBucket,
  availableLiveCredits,
  availableOneOnOneCredits,
} from "../credits/lib";
import { consumeLiveCredits } from "../credits/consumeLive";
import { consumeOneOnOneCredits } from "../credits/consumeOneOnOne";
import { missingRequiredEquipment } from "../lib/equipment";
import { RULES } from "../lib/constants";
import { roomNameForClass } from "../lib/live";

type JoinContext = {
  ctx: MutationCtx;
  userId: Id<"users">;
  profile: Doc<"appProfiles">;
  liveClass: Doc<"liveClasses">;
  now: number;
};

/** Validates auth, class existence, and join window. Returns participant role. */
async function validateJoinEligibility({ ctx, userId, profile, liveClass, now }: JoinContext) {
  if (liveClass.status !== "live") throw new Error("השיעור אינו חי");

  const isAdmin = profile.role === "admin";
  const isInstructor = liveClass.instructorUserId === userId || isAdmin;
  const participantRole: "instructor" | "customer" | "admin" = isAdmin
    ? "admin"
    : isInstructor
      ? "instructor"
      : "customer";

  if (!isInstructor && (now < liveClass.joinOpensAt || now > liveClass.joinClosesAt)) {
    throw new Error("השיעור מחוץ לחלון ההצטרפות");
  }

  return { isInstructor, participantRole };
}

/** Checks member profile and equipment for non-instructors. */
async function checkMemberRequirements({ ctx, userId, liveClass }: JoinContext) {
  const memberProfile = await ctx.db
    .query("memberProfiles")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .unique();
  if (memberProfile === null) throw new Error("נדרש פרופיל פילאטיס");
  if (
    missingRequiredEquipment(memberProfile.equipment, liveClass.requiredEquipment).length > 0
  ) {
    throw new Error("חסר ציוד נדרש");
  }
}

/** Handles reserved → joined transition (consumes credits). */
async function upgradeReservation(
  { ctx, now }: JoinContext,
  reservation: Doc<"liveReservations">,
) {
  const bucket = await ctx.db.get(reservation.creditBucketId);
  if (bucket === null) throw new Error("תיק הנקודות המשויך להרשמה לא נמצא");

  if (reservation.creditKind === "live") {
    await consumeLiveCredits(ctx, bucket, reservation.creditsReserved);
  } else {
    await consumeOneOnOneCredits(ctx, bucket, reservation.creditsReserved);
  }

  await ctx.db.patch(reservation._id, {
    status: "joined",
    joinedAt: now,
  });
}

/** Handles walk-in join: capacity check, credit consumption, reservation creation. */
async function handleWalkIn({ ctx, userId, liveClass, now }: JoinContext) {
  const walkInReservations = await ctx.db
    .query("liveReservations")
    .withIndex("by_liveClassId_and_status", (q) => q.eq("liveClassId", liveClass._id))
    .take(liveClass.capacity + 1);
  const seatsTaken = walkInReservations.filter(
    (r) => r.status === "reserved" || r.status === "joined",
  ).length;
  if (seatsTaken >= liveClass.capacity) {
    throw new Error("השיעור מלא");
  }

  const bucket = await getCurrentCreditBucket(ctx, userId);
  if (bucket === null) throw new Error("אין תיק נקודות פעיל");
  const available =
    liveClass.creditKind === "live"
      ? availableLiveCredits(bucket)
      : availableOneOnOneCredits(bucket);
  if (available < liveClass.creditCost) {
    throw new Error("אין מספיק נקודות");
  }

  if (liveClass.creditKind === "live") {
    await ctx.db.patch(bucket._id, { liveUsed: bucket.liveUsed + liveClass.creditCost });
  } else {
    await ctx.db.patch(bucket._id, { oneOnOneUsed: bucket.oneOnOneUsed + liveClass.creditCost });
  }

  await ctx.db.insert("liveReservations", {
    liveClassId: liveClass._id,
    userId,
    creditBucketId: bucket._id,
    status: "joined",
    creditKind: liveClass.creditKind,
    creditsReserved: liveClass.creditCost,
    reservedAt: now,
    joinedAt: now,
  });

  await ctx.db.patch(liveClass._id, { seatsTaken: seatsTaken + 1 });
}

/** Creates a live room record if one does not already exist. */
async function ensureRoomExists(
  { ctx, userId, liveClass, now }: JoinContext,
  isInstructor: boolean,
): Promise<Doc<"liveRooms">> {
  let room = await ctx.db
    .query("liveRooms")
    .withIndex("by_liveClassId", (q) => q.eq("liveClassId", liveClass._id))
    .unique();

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
  participantRole: "instructor" | "customer" | "admin",
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
    const { isInstructor, participantRole } = await validateJoinEligibility(joinCtx);

    let joinReason = "join_token_issued";

    if (!isInstructor) {
      const reservation = await ctx.db
        .query("liveReservations")
        .withIndex("by_liveClassId_and_userId", (q) =>
          q.eq("liveClassId", args.liveClassId).eq("userId", userId),
        )
        .unique();

      await checkMemberRequirements(joinCtx);

      if (reservation !== null && reservation.status === "joined") {
        joinReason = "rejoin_token_issued";
      } else if (reservation !== null && reservation.status === "reserved") {
        await upgradeReservation(joinCtx, reservation);
      } else if (reservation === null) {
        await handleWalkIn(joinCtx);
        joinReason = "mid_live_walk_in";
      } else {
        throw new Error("נדרשת הרשמה מראש");
      }
    }

    const room = await ensureRoomExists(joinCtx, isInstructor);
    await logJoinEvent(joinCtx, participantRole, joinReason);

    return {
      userId,
      displayName: profile.displayName,
      roomName: room.roomName,
      participantRole,
      liveClassId: liveClass._id,
      liveClassType: liveClass.type,
      startsAt: liveClass.startsAt,
      endsAt: liveClass.endsAt,
      joinClosesAt: liveClass.joinClosesAt,
      capacity: liveClass.capacity,
    };
  },
});
