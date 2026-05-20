import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { requireAppProfile, requireRole, requireUserId } from "./lib/authz";
import { equipmentListValidator } from "./lib/validators";

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const profile = await requireAppProfile(ctx, userId);
    requireRole(profile, ["instructor", "admin"]);

    return await ctx.db
      .query("liveClasses")
      .withIndex("by_instructorUserId_and_startsAt", (q) => q.eq("instructorUserId", userId))
      .order("desc")
      .take(50);
  },
});

export const createLiveClass = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    type: v.union(v.literal("group_live"), v.literal("one_on_one")),
    startsAt: v.number(),
    durationMinutes: v.number(),
    joinOpensMinutesBefore: v.number(),
    capacity: v.number(),
    requiredEquipment: equipmentListValidator,
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const profile = await requireAppProfile(ctx, userId);
    requireRole(profile, ["instructor", "admin"]);

    if (args.title.trim().length < 3) throw new Error("כותרת השיעור קצרה מדי");
    if (args.durationMinutes < 15 || args.durationMinutes > 180) {
      throw new Error("משך השיעור חייב להיות בין 15 ל-180 דקות");
    }
    const maxCapacity = args.type === "one_on_one" ? 1 : 12;
    if (args.capacity < 1 || args.capacity > maxCapacity) {
      throw new Error(args.type === "one_on_one" ? "שיעור 1:1 חייב להיות עם קיבולת 1" : "הקיבולת חייבת להיות בין 1 ל-12");
    }
    if (args.requiredEquipment.length === 0) throw new Error("חובה לבחור לפחות פריט ציוד אחד");
    if (args.joinOpensMinutesBefore < 0 || args.joinOpensMinutesBefore > 60) {
      throw new Error("זמן פתיחת כניסה חייב להיות בין 0 ל-60 דקות");
    }

    const now = Date.now();
    const endsAt = args.startsAt + args.durationMinutes * 60 * 1000;
    const joinOpensAt = args.startsAt - args.joinOpensMinutesBefore * 60 * 1000;
    const joinClosesAt = endsAt;

    if (args.startsAt <= now - 5 * 60 * 1000) throw new Error("ניתן לתזמן שיעור רק לעתיד");

    return await ctx.db.insert("liveClasses", {
      title: args.title.trim(),
      description: args.description.trim(),
      type: args.type,
      instructorUserId: userId,
      startsAt: args.startsAt,
      endsAt,
      joinOpensAt,
      joinClosesAt,
      capacity: args.capacity,
      requiredEquipment: args.requiredEquipment,
      creditKind: args.type === "one_on_one" ? "oneOnOne" : "live",
      creditCost: 1,
      seatsTaken: 0,
      status: "scheduled",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const startLive = mutation({
  args: {
    liveClassId: v.id("liveClasses"),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const profile = await requireAppProfile(ctx, userId);
    requireRole(profile, ["instructor", "admin"]);

    const liveClass = await ctx.db.get(args.liveClassId);
    if (liveClass === null) throw new Error("Class not found");
    if (liveClass.type !== "group_live" && liveClass.type !== "one_on_one") {
      throw new Error("Only live classes use LiveKit");
    }
    if (profile.role !== "admin" && liveClass.instructorUserId !== userId) {
      throw new Error("Unauthorized");
    }
    if (liveClass.status !== "scheduled" && liveClass.status !== "live") {
      throw new Error("Class cannot be started");
    }

    const now = Date.now();
    // Allow instructors to start anytime. joinOpensAt controls when students can enter.
    if (now > liveClass.joinClosesAt) {
      throw new Error("Class has already ended");
    }

    await ctx.db.patch(args.liveClassId, {
      status: "live",
      updatedAt: now,
    });

    const existingRoom = await ctx.db
      .query("liveRooms")
      .withIndex("by_liveClassId", (q) => q.eq("liveClassId", args.liveClassId))
      .unique();

    if (existingRoom === null) {
      await ctx.db.insert("liveRooms", {
        liveClassId: args.liveClassId,
        provider: "livekit",
        roomName: `homebody_liveClass_${args.liveClassId}`,
        status: "active",
        startedAt: now,
        startedByUserId: userId,
        updatedAt: now,
      });
    } else {
      await ctx.db.patch(existingRoom._id, {
        status: "active",
        startedAt: existingRoom.startedAt ?? now,
        startedByUserId: existingRoom.startedByUserId ?? userId,
        updatedAt: now,
      });
    }

    return args.liveClassId;
  },
});

export const endLive = mutation({
  args: {
    liveClassId: v.id("liveClasses"),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const profile = await requireAppProfile(ctx, userId);
    requireRole(profile, ["instructor", "admin"]);

    const liveClass = await ctx.db.get(args.liveClassId);
    if (liveClass === null) throw new Error("Class not found");
    if (profile.role !== "admin" && liveClass.instructorUserId !== userId) {
      throw new Error("Unauthorized");
    }

    const now = Date.now();
    await ctx.db.patch(args.liveClassId, {
      status: "ended",
      updatedAt: now,
    });

    const room = await ctx.db
      .query("liveRooms")
      .withIndex("by_liveClassId", (q) => q.eq("liveClassId", args.liveClassId))
      .unique();

    if (room !== null) {
      await ctx.db.patch(room._id, {
        status: "ended",
        endedAt: now,
        updatedAt: now,
      });
    }

    await ctx.runMutation(internal.liveClasses.settleClassReservations, {
      liveClassId: args.liveClassId,
    });

    return args.liveClassId;
  },
});

export const rescheduleLiveClass = mutation({
  args: {
    liveClassId: v.id("liveClasses"),
    startsAt: v.number(),
    durationMinutes: v.number(),
    joinOpensMinutesBefore: v.number(),
    capacity: v.number(),
    requiredEquipment: equipmentListValidator,
    title: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const profile = await requireAppProfile(ctx, userId);
    requireRole(profile, ["instructor", "admin"]);

    const liveClass = await ctx.db.get(args.liveClassId);
    if (liveClass === null) throw new Error("Class not found");
    if (profile.role !== "admin" && liveClass.instructorUserId !== userId) {
      throw new Error("Unauthorized");
    }
    if (liveClass.status !== "scheduled") {
      throw new Error("Only scheduled classes can be rescheduled");
    }

    if (args.durationMinutes < 15 || args.durationMinutes > 180) {
      throw new Error("משך השיעור חייב להיות בין 15 ל-180 דקות");
    }
    const maxCapacity = liveClass.type === "one_on_one" ? 1 : 12;
    if (args.capacity < 1 || args.capacity > maxCapacity) {
      throw new Error("קיבולת לא תקינה");
    }
    if (args.requiredEquipment.length === 0) {
      throw new Error("חובה לבחור לפחות פריט ציוד אחד");
    }
    if (args.joinOpensMinutesBefore < 0 || args.joinOpensMinutesBefore > 60) {
      throw new Error("זמן פתיחת כניסה חייב להיות בין 0 ל-60 דקות");
    }

    const now = Date.now();
    const endsAt = args.startsAt + args.durationMinutes * 60 * 1000;
    const joinOpensAt = args.startsAt - args.joinOpensMinutesBefore * 60 * 1000;
    const joinClosesAt = endsAt;

    if (args.startsAt <= now - 5 * 60 * 1000) {
      throw new Error("ניתן לתזמן שיעור רק לעתיד");
    }

    // Update the class
    const patch: Record<string, unknown> = {
      startsAt: args.startsAt,
      endsAt,
      joinOpensAt,
      joinClosesAt,
      capacity: args.capacity,
      requiredEquipment: args.requiredEquipment,
      updatedAt: now,
    };
    if (args.title !== undefined && args.title.trim().length >= 3) {
      patch.title = args.title.trim();
    }
    if (args.description !== undefined) {
      patch.description = args.description.trim();
    }
    await ctx.db.patch(args.liveClassId, patch);

    // Update reminder times
    const reminders = await ctx.db
      .query("liveReminderEvents")
      .withIndex("by_liveClassId", (q) => q.eq("liveClassId", args.liveClassId))
      .collect();

    for (const reminder of reminders) {
      if (reminder.status !== "pending") continue;

      let newSendAt = args.startsAt;
      if (reminder.kind === "day_before") {
        newSendAt = args.startsAt - 24 * 60 * 60 * 1000;
      } else if (reminder.kind === "thirty_minutes") {
        newSendAt = args.startsAt - 30 * 60 * 1000;
      }

      if (newSendAt <= now) {
        await ctx.db.patch(reminder._id, {
          status: "skipped",
          processedAt: now,
        });
      } else {
        await ctx.db.patch(reminder._id, {
          sendAt: newSendAt,
        });
      }
    }

    return args.liveClassId;
  },
});

export const cancelLiveClass = mutation({
  args: {
    liveClassId: v.id("liveClasses"),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const profile = await requireAppProfile(ctx, userId);
    requireRole(profile, ["instructor", "admin"]);

    const liveClass = await ctx.db.get(args.liveClassId);
    if (liveClass === null) throw new Error("Class not found");
    if (profile.role !== "admin" && liveClass.instructorUserId !== userId) {
      throw new Error("Unauthorized");
    }
    if (liveClass.status !== "scheduled" && liveClass.status !== "live") {
      throw new Error("Class cannot be cancelled in this status");
    }

    const now = Date.now();

    // Cancel class status
    await ctx.db.patch(args.liveClassId, {
      status: "cancelled",
      updatedAt: now,
    });

    // Refund active reservations and fix seatsTaken
    const reservations = await ctx.db
      .query("liveReservations")
      .withIndex("by_liveClassId_and_status", (q) =>
        q.eq("liveClassId", args.liveClassId).eq("status", "reserved"),
      )
      .collect();

    for (const res of reservations) {
      const bucket = await ctx.db.get(res.creditBucketId);
      if (bucket !== null) {
        if (res.creditKind === "live") {
          await ctx.db.patch(bucket._id, {
            liveReserved: Math.max(0, (bucket.liveReserved ?? 0) - res.creditsReserved),
          });
        } else {
          await ctx.db.patch(bucket._id, {
            oneOnOneReserved: Math.max(0, (bucket.oneOnOneReserved ?? 0) - res.creditsReserved),
          });
        }
      }
      await ctx.db.patch(res._id, {
        status: "cancelled",
        cancelledAt: now,
      });
    }

    // Reset seatsTaken since all reservations are cancelled
    await ctx.db.patch(args.liveClassId, {
      seatsTaken: 0,
      updatedAt: now,
    });

    // Cancel pending reminders
    const reminders = await ctx.db
      .query("liveReminderEvents")
      .withIndex("by_liveClassId", (q) => q.eq("liveClassId", args.liveClassId))
      .collect();

    for (const reminder of reminders) {
      if (reminder.status === "pending") {
        await ctx.db.patch(reminder._id, {
          status: "cancelled",
          processedAt: now,
        });
      }
    }

    return args.liveClassId;
  },
});
