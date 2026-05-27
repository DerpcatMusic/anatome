import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import type { MutationCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import { requireAppProfile, requireUserId } from "../lib/authz";
import { prepareJoinResultValidator } from "./joinContract";
import type { LiveParticipantRole } from "./joinContract";
import { ensureLiveRoomForClass } from "../lib/liveRoom";
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
      } else {
        throw new Error("נדרשת הרשמה מראש");
      }
    }

    const room = await ensureLiveRoomForClass(
      ctx,
      liveClass._id,
      now,
      isInstructor ? { startedByUserId: userId } : undefined,
    );
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
