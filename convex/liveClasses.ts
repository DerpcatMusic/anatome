import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { requireAppProfile, requireRole, requireUserId } from "./lib/authz";
import { getAuthUserId } from "@convex-dev/auth/server";
import { equipmentListValidator } from "./lib/validators";
import { getCurrentCreditBucket } from "./lib/credits";
import { missingRequiredEquipment } from "./lib/equipment";

const classType = v.union(v.literal("group_live"), v.literal("one_on_one"));
const creditKind = v.union(v.literal("live"), v.literal("oneOnOne"));

function roomNameForClass(liveClassId: Id<"liveClasses">) {
  return `homebody_liveClass_${liveClassId}`;
}

function availableCredits(
  bucket: NonNullable<Awaited<ReturnType<typeof getCurrentCreditBucket>>>,
  kind: "live" | "oneOnOne",
) {
  if (kind === "live") {
    return bucket.liveGranted - bucket.liveUsed - (bucket.liveReserved ?? 0);
  }
  return bucket.oneOnOneGranted - bucket.oneOnOneUsed - (bucket.oneOnOneReserved ?? 0);
}

function validateClassCreditModel(type: "group_live" | "one_on_one", kind: "live" | "oneOnOne", cost: number) {
  if (cost !== 1) throw new Error("Live classes always cost 1 credit");
  if (type === "group_live" && kind !== "live") throw new Error("Group live must use live credits");
  if (type === "one_on_one" && kind !== "oneOnOne") throw new Error("1:1 live must use 1:1 credits");
}

async function insertReminderEvents(
  ctx: MutationCtx,
  liveClassId: Id<"liveClasses">,
  reservationId: Id<"liveReservations">,
  userId: Id<"users">,
  startsAt: number,
) {
  const now = Date.now();
  const reminders = [
    { kind: "day_before" as const, sendAt: startsAt - 24 * 60 * 60 * 1000 },
    { kind: "thirty_minutes" as const, sendAt: startsAt - 30 * 60 * 1000 },
  ].filter((reminder) => reminder.sendAt > now);

  for (const reminder of reminders) {
    await ctx.db.insert("liveReminderEvents", {
      liveClassId,
      reservationId,
      userId,
      kind: reminder.kind,
      sendAt: reminder.sendAt,
      status: "pending",
      createdAt: now,
    });
  }
}

export const listUpcoming = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const scheduled = await ctx.db
      .query("liveClasses")
      .withIndex("by_status_and_startsAt", (q) => q.eq("status", "scheduled").gte("startsAt", now))
      .order("asc")
      .take(50);
    const live = await ctx.db
      .query("liveClasses")
      .withIndex("by_status_and_startsAt", (q) => q.eq("status", "live"))
      .order("asc")
      .take(50);

    return [...live, ...scheduled].sort((a, b) => a.startsAt - b.startsAt).slice(0, 50);
  },
});

export const listCalendarRange = query({
  args: {
    from: v.number(),
    to: v.number(),
  },
  handler: async (ctx, args) => {
    if (args.from >= args.to) {
      throw new Error("Invalid calendar range");
    }

    const userId = await getAuthUserId(ctx);
    const classes = await ctx.db
      .query("liveClasses")
      .withIndex("by_startsAt", (q) => q.gte("startsAt", args.from).lt("startsAt", args.to))
      .order("asc")
      .take(100);

    const bucket = userId === null ? null : await getCurrentCreditBucket(ctx, userId);

    // Batch-fetch all viewer reservations once instead of N+1 per class
    const viewerReservations =
      userId === null
        ? []
        : await ctx.db
            .query("liveReservations")
            .withIndex("by_userId_and_reservedAt", (q) => q.eq("userId", userId))
            .take(200);
    const viewerReservationMap = new Map(viewerReservations.map((r) => [r.liveClassId, r]));

    const memberProfile =
      userId === null
        ? null
        : await ctx.db
            .query("memberProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .unique();
    const now = Date.now();

    // Batch-fetch all class reservations once instead of N+1 per class
    const classIdSet = new Set(classes.map((c) => c._id));
    const reservationsByClass = new Map<Id<"liveClasses">, Doc<"liveReservations">[]>();
    for await (const r of ctx.db.query("liveReservations")) {
      if (!classIdSet.has(r.liveClassId)) continue;
      const arr = reservationsByClass.get(r.liveClassId) ?? [];
      arr.push(r);
      reservationsByClass.set(r.liveClassId, arr);
    }

    const results = [];
    for (const liveClass of classes) {
      const classReservations = reservationsByClass.get(liveClass._id) ?? [];
      const seatsTaken =
        liveClass.seatsTaken ??
        classReservations.filter((r) => r.status === "reserved" || r.status === "joined").length;

      const viewerReservation = viewerReservationMap.get(liveClass._id) ?? null;
      const available =
        bucket === null
          ? 0
          : liveClass.creditKind === "live"
            ? bucket.liveGranted - bucket.liveUsed - (bucket.liveReserved ?? 0)
            : bucket.oneOnOneGranted - bucket.oneOnOneUsed - (bucket.oneOnOneReserved ?? 0);
      const viewerReservationStatus = viewerReservation?.status ?? null;
      const viewerMissingEquipment = missingRequiredEquipment(
        memberProfile?.equipment ?? [],
        liveClass.requiredEquipment,
      );

      results.push({
        liveClass,
        seatsTaken,
        seatsRemaining: Math.max(0, liveClass.capacity - seatsTaken),
        viewerReservationStatus,
        viewerCanReserve:
          userId !== null &&
          viewerReservationStatus === null &&
          (liveClass.status === "scheduled" || liveClass.status === "live") &&
          seatsTaken < liveClass.capacity &&
          viewerMissingEquipment.length === 0 &&
          available >= liveClass.creditCost,
        viewerCanJoin:
          userId !== null &&
          (liveClass.type === "group_live" || liveClass.type === "one_on_one") &&
          liveClass.status === "live" &&
          viewerReservationStatus !== null &&
          viewerReservationStatus !== "cancelled" &&
          viewerReservationStatus !== "refunded" &&
          now >= liveClass.joinOpensAt &&
          now <= liveClass.joinClosesAt,
        viewerAvailableCredits: available,
        viewerMissingEquipment,
      });
    }

    return results;
  },
});

export const listMyReservations = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    return await ctx.db
      .query("liveReservations")
      .withIndex("by_userId_and_reservedAt", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);
  },
});

export const get = query({
  args: {
    liveClassId: v.id("liveClasses"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.liveClassId);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    type: classType,
    instructorUserId: v.id("users"),
    startsAt: v.number(),
    endsAt: v.number(),
    joinOpensAt: v.number(),
    joinClosesAt: v.number(),
    capacity: v.number(),
    requiredEquipment: equipmentListValidator,
    creditKind,
    creditCost: v.number(),
    status: v.union(v.literal("draft"), v.literal("scheduled")),
  },
  handler: async (ctx, args) => {
    const actorUserId = await requireUserId(ctx);
    const actorProfile = await requireAppProfile(ctx, actorUserId);
    requireRole(actorProfile, ["admin"]);

    const instructorProfile = await requireAppProfile(ctx, args.instructorUserId);
    requireRole(instructorProfile, ["instructor", "admin"]);

    if (args.capacity < 1) throw new Error("Capacity must be positive");
    validateClassCreditModel(args.type, args.creditKind, args.creditCost);
    if (args.startsAt >= args.endsAt) throw new Error("Class start must be before end");
    if (args.joinOpensAt > args.joinClosesAt) throw new Error("Join window is invalid");
    if (args.requiredEquipment.length === 0) throw new Error("At least one equipment item is required");

    const now = Date.now();
    return await ctx.db.insert("liveClasses", {
      ...args,
      seatsTaken: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const reserve = mutation({
  args: {
    liveClassId: v.id("liveClasses"),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const profile = await requireAppProfile(ctx, userId);
    requireRole(profile, ["customer", "instructor", "admin"]);

    const liveClass = await ctx.db.get(args.liveClassId);
    if (liveClass === null) throw new Error("Class not found");
    if (liveClass.status !== "scheduled" && liveClass.status !== "live") {
      throw new Error("Class is not available");
    }
    if (Date.now() > liveClass.joinClosesAt) {
      throw new Error("Class RSVP window is closed");
    }
    const memberProfile = await ctx.db
      .query("memberProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (memberProfile === null) throw new Error("Pilates profile required");
    if (missingRequiredEquipment(memberProfile.equipment, liveClass.requiredEquipment).length > 0) {
      throw new Error("Required equipment missing");
    }

    const existing = await ctx.db
      .query("liveReservations")
      .withIndex("by_liveClassId_and_userId", (q) =>
        q.eq("liveClassId", args.liveClassId).eq("userId", userId),
      )
      .unique();

    if (existing !== null && (existing.status === "reserved" || existing.status === "joined")) {
      return existing._id;
    }

    let seatsTaken = liveClass.seatsTaken ?? 0;
    if (liveClass.seatsTaken === undefined) {
      const allReservations = await ctx.db
        .query("liveReservations")
        .withIndex("by_liveClassId_and_status", (q) => q.eq("liveClassId", args.liveClassId))
        .take(liveClass.capacity + 1);
      seatsTaken = allReservations.filter((r) => r.status === "reserved" || r.status === "joined").length;
      await ctx.db.patch(args.liveClassId, { seatsTaken });
    }
    if (seatsTaken >= liveClass.capacity) {
      throw new Error("Class is full");
    }

    const bucket = await getCurrentCreditBucket(ctx, userId);
    if (bucket === null) throw new Error("No active credit bucket");
    if (availableCredits(bucket, liveClass.creditKind) < liveClass.creditCost) {
      throw new Error("Insufficient credits");
    }

    const now = Date.now();
    if (liveClass.creditKind === "live") {
      await ctx.db.patch(bucket._id, { liveReserved: (bucket.liveReserved ?? 0) + liveClass.creditCost });
    } else {
      await ctx.db.patch(bucket._id, {
        oneOnOneReserved: (bucket.oneOnOneReserved ?? 0) + liveClass.creditCost,
      });
    }

    const reservationId = await ctx.db.insert("liveReservations", {
      liveClassId: args.liveClassId,
      userId,
      creditBucketId: bucket._id,
      status: "reserved",
      creditKind: liveClass.creditKind,
      creditsReserved: liveClass.creditCost,
      reservedAt: now,
    });
    await ctx.db.patch(args.liveClassId, { seatsTaken: seatsTaken + 1 });
    await insertReminderEvents(ctx, args.liveClassId, reservationId, userId, liveClass.startsAt);
    return reservationId;
  },
});

export const cancelReservation = mutation({
  args: {
    liveClassId: v.id("liveClasses"),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const reservation = await ctx.db
      .query("liveReservations")
      .withIndex("by_liveClassId_and_userId", (q) =>
        q.eq("liveClassId", args.liveClassId).eq("userId", userId),
      )
      .unique();

    if (reservation === null || reservation.status !== "reserved") {
      throw new Error("Active reservation not found");
    }

    const liveClass = await ctx.db.get(args.liveClassId);

    const bucket = await ctx.db.get(reservation.creditBucketId);
    if (bucket !== null) {
      if (reservation.creditKind === "live") {
        await ctx.db.patch(bucket._id, {
          liveReserved: Math.max(0, (bucket.liveReserved ?? 0) - reservation.creditsReserved),
        });
      } else {
        await ctx.db.patch(bucket._id, {
          oneOnOneReserved: Math.max(0, (bucket.oneOnOneReserved ?? 0) - reservation.creditsReserved),
        });
      }
    }

    await ctx.db.patch(reservation._id, {
      status: "cancelled",
      cancelledAt: Date.now(),
    });

    if (liveClass !== null) {
      await ctx.db.patch(args.liveClassId, {
        seatsTaken: Math.max(0, (liveClass.seatsTaken ?? 0) - 1),
      });
    }

    const reminders = await ctx.db
      .query("liveReminderEvents")
      .withIndex("by_reservationId", (q) => q.eq("reservationId", reservation._id))
      .collect();
    for (const reminder of reminders) {
      if (reminder.status === "pending") {
        await ctx.db.patch(reminder._id, {
          status: "cancelled",
          processedAt: Date.now(),
        });
      }
    }

    return reservation._id;
  },
});

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

    const isInstructor = liveClass.instructorUserId === userId || profile.role === "admin";
    const participantRole: "instructor" | "customer" = isInstructor ? "instructor" : "customer";

    if (!isInstructor && (now < liveClass.joinOpensAt || now > liveClass.joinClosesAt)) {
      throw new Error("Class is outside the join window");
    }

    if (!isInstructor) {
      const reservation = await ctx.db
        .query("liveReservations")
        .withIndex("by_liveClassId_and_userId", (q) =>
          q.eq("liveClassId", args.liveClassId).eq("userId", userId),
        )
        .unique();

      if (reservation === null || reservation.status === "cancelled" || reservation.status === "refunded") {
        throw new Error("Reservation required");
      }

      const memberProfile = await ctx.db
        .query("memberProfiles")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .unique();
      if (memberProfile === null) throw new Error("Pilates profile required");
      if (missingRequiredEquipment(memberProfile.equipment, liveClass.requiredEquipment).length > 0) {
        throw new Error("Required equipment missing");
      }

      if (reservation.status === "reserved") {
        const bucket = await ctx.db.get(reservation.creditBucketId);
        if (bucket === null) throw new Error("Reservation credit bucket not found");

        if (reservation.creditKind === "live") {
          await ctx.db.patch(bucket._id, {
            liveReserved: Math.max(0, (bucket.liveReserved ?? 0) - reservation.creditsReserved),
            liveUsed: bucket.liveUsed + reservation.creditsReserved,
          });
        } else {
          await ctx.db.patch(bucket._id, {
            oneOnOneReserved: Math.max(0, (bucket.oneOnOneReserved ?? 0) - reservation.creditsReserved),
            oneOnOneUsed: bucket.oneOnOneUsed + reservation.creditsReserved,
          });
        }

        await ctx.db.patch(reservation._id, {
          status: "joined",
          joinedAt: now,
        });
      }
    }

    let room = await ctx.db
      .query("liveRooms")
      .withIndex("by_liveClassId", (q) => q.eq("liveClassId", args.liveClassId))
      .unique();

    if (room === null) {
      const newRoom = {
        liveClassId: args.liveClassId,
        provider: "livekit",
        roomName: roomNameForClass(args.liveClassId),
        status: "active",
        startedAt: now,
        updatedAt: now,
      } as const;
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
      reason: "join_token_issued",
      createdAt: now,
    });

    return {
      userId,
      displayName: profile.displayName,
      roomName: room.roomName,
      participantRole,
    };
  },
});
