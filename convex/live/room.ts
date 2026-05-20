import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { requireAppProfile, requireUserId } from "../lib/authz";
import {
  getCurrentCreditBucket,
  availableLiveCredits,
  availableOneOnOneCredits,
} from "../credits/lib";
import { consumeLiveCredits } from "../credits/consumeLive";
import { consumeOneOnOneCredits } from "../credits/consumeOneOnOne";
import { missingRequiredEquipment } from "../lib/equipment";

function roomNameForClass(liveClassId: Id<"liveClasses">) {
  return `homebody_liveClass_${liveClassId}`;
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

    if (liveClass === null) throw new Error("Class not found");
    if (liveClass.type !== "group_live" && liveClass.type !== "one_on_one") {
      throw new Error("LiveKit is only enabled for live classes");
    }
    if (liveClass.status !== "live") throw new Error("Class is not live");

    const isAdmin = profile.role === "admin";
    const isInstructor = liveClass.instructorUserId === userId || isAdmin;
    const participantRole: "instructor" | "customer" | "admin" = isAdmin
      ? "admin"
      : isInstructor
        ? "instructor"
        : "customer";

    if (!isInstructor && (now < liveClass.joinOpensAt || now > liveClass.joinClosesAt)) {
      throw new Error("Class is outside the join window");
    }

    let joinReason = "join_token_issued";

    if (!isInstructor) {
      const reservation = await ctx.db
        .query("liveReservations")
        .withIndex("by_liveClassId_and_userId", (q) =>
          q.eq("liveClassId", args.liveClassId).eq("userId", userId),
        )
        .unique();

      const memberProfile = await ctx.db
        .query("memberProfiles")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .unique();
      if (memberProfile === null) throw new Error("Pilates profile required");
      if (
        missingRequiredEquipment(memberProfile.equipment, liveClass.requiredEquipment)
          .length > 0
      ) {
        throw new Error("Required equipment missing");
      }

      if (reservation !== null && reservation.status === "joined") {
        joinReason = "rejoin_token_issued";
      } else if (reservation !== null && reservation.status === "reserved") {
        const bucket = await ctx.db.get(reservation.creditBucketId);
        if (bucket === null) throw new Error("Reservation credit bucket not found");

        if (reservation.creditKind === "live") {
          await consumeLiveCredits(ctx, bucket, reservation.creditsReserved);
        } else {
          await consumeOneOnOneCredits(ctx, bucket, reservation.creditsReserved);
        }

        await ctx.db.patch(reservation._id, {
          status: "joined",
          joinedAt: now,
        });
      } else if (reservation === null) {
        const walkInReservations = await ctx.db
          .query("liveReservations")
          .withIndex("by_liveClassId_and_status", (q) =>
            q.eq("liveClassId", args.liveClassId),
          )
          .take(liveClass.capacity + 1);
        const seatsTaken = walkInReservations.filter(
          (r) => r.status === "reserved" || r.status === "joined",
        ).length;
        if (seatsTaken >= liveClass.capacity) {
          throw new Error("Class is full");
        }

        const bucket = await getCurrentCreditBucket(ctx, userId);
        if (bucket === null) throw new Error("No active credit bucket");
        const available =
          liveClass.creditKind === "live"
            ? availableLiveCredits(bucket)
            : availableOneOnOneCredits(bucket);
        if (available < liveClass.creditCost) {
          throw new Error("Insufficient credits");
        }

        if (liveClass.creditKind === "live") {
          await ctx.db.patch(bucket._id, {
            liveUsed: bucket.liveUsed + liveClass.creditCost,
          });
        } else {
          await ctx.db.patch(bucket._id, {
            oneOnOneUsed: bucket.oneOnOneUsed + liveClass.creditCost,
          });
        }

        await ctx.db.insert("liveReservations", {
          liveClassId: args.liveClassId,
          userId,
          creditBucketId: bucket._id,
          status: "joined",
          creditKind: liveClass.creditKind,
          creditsReserved: liveClass.creditCost,
          reservedAt: now,
          joinedAt: now,
        });

        await ctx.db.patch(liveClass._id, { seatsTaken: seatsTaken + 1 });
        joinReason = "mid_live_walk_in";
      } else {
        throw new Error("Reservation required");
      }
    }

    let room = await ctx.db
      .query("liveRooms")
      .withIndex("by_liveClassId", (q) => q.eq("liveClassId", args.liveClassId))
      .unique();

    if (room === null) {
      const newRoom = {
        liveClassId: args.liveClassId,
        provider: "livekit" as const,
        roomName: roomNameForClass(args.liveClassId),
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

    await ctx.db.insert("liveJoinEvents", {
      liveClassId: args.liveClassId,
      userId,
      role: participantRole,
      result: "allowed",
      reason: joinReason,
      createdAt: now,
    });

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
