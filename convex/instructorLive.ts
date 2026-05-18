import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
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

    if (args.title.trim().length < 3) throw new Error("Title is too short");
    if (args.durationMinutes < 15 || args.durationMinutes > 180) {
      throw new Error("Duration must be between 15 and 180 minutes");
    }
    const maxCapacity = args.type === "one_on_one" ? 1 : 12;
    if (args.capacity < 1 || args.capacity > maxCapacity) {
      throw new Error(args.type === "one_on_one" ? "1:1 live capacity must be 1" : "Capacity must be between 1 and 12");
    }
    if (args.requiredEquipment.length === 0) throw new Error("At least one equipment item is required");

    const now = Date.now();
    const endsAt = args.startsAt + args.durationMinutes * 60 * 1000;
    const joinOpensAt = args.startsAt - args.joinOpensMinutesBefore * 60 * 1000;
    const joinClosesAt = endsAt;

    if (args.startsAt <= now - 5 * 60 * 1000) throw new Error("Class must be scheduled in the future");

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

    return args.liveClassId;
  },
});
