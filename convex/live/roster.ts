import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { requireUserId, requireAppProfile } from "../lib/authz";
import { LOBBY_PRESENCE_STALE_MS } from "../lib/constants";
import { displayNameForUser } from "../lib/memberDisplay";
import { requireQueryNow } from "../lib/queryNow";
import { viewerIsInstructorForClass } from "./joinAccess";

const lobbyPhaseValidator = v.union(
  v.literal("waiting_broadcast"),
  v.literal("device_setup"),
);

const rosterMemberValidator = v.object({
  userId: v.id("users"),
  displayName: v.string(),
  status: v.union(v.literal("reserved"), v.literal("joined")),
  reservedAt: v.number(),
  joinedAt: v.union(v.number(), v.null()),
});

const lobbyMemberValidator = v.object({
  userId: v.id("users"),
  displayName: v.string(),
  phase: lobbyPhaseValidator,
  lastSeenAt: v.number(),
});

const classRosterSummaryValidator = v.object({
  capacity: v.number(),
  seatsTaken: v.number(),
  reservedCount: v.number(),
  joinedCount: v.number(),
  lobbyWaitingCount: v.number(),
});

export type ClassRosterSummary = {
  capacity: number;
  seatsTaken: number;
  reservedCount: number;
  joinedCount: number;
  lobbyWaitingCount: number;
};

export async function loadClassRosterSummary(
  ctx: QueryCtx,
  liveClassId: Id<"liveClasses">,
  liveClass: Pick<Doc<"liveClasses">, "capacity" | "seatsTaken">,
  now: number,
): Promise<ClassRosterSummary> {
  const reservedRows = await ctx.db
    .query("liveReservations")
    .withIndex("by_liveClassId_and_status", (q) =>
      q.eq("liveClassId", liveClassId).eq("status", "reserved"),
    )
    .collect();
  const joinedRows = await ctx.db
    .query("liveReservations")
    .withIndex("by_liveClassId_and_status", (q) =>
      q.eq("liveClassId", liveClassId).eq("status", "joined"),
    )
    .collect();

  const staleBefore = now - LOBBY_PRESENCE_STALE_MS;
  const lobbyRows = await ctx.db
    .query("liveLobbyPresence")
    .withIndex("by_liveClassId_and_lastSeenAt", (q) =>
      q.eq("liveClassId", liveClassId).gte("lastSeenAt", staleBefore),
    )
    .collect();

  const joinedUserIds = new Set(joinedRows.map((row) => row.userId as string));

  return {
    capacity: liveClass.capacity,
    seatsTaken: liveClass.seatsTaken ?? reservedRows.length + joinedRows.length,
    reservedCount: reservedRows.length,
    joinedCount: joinedRows.length,
    lobbyWaitingCount: lobbyRows.filter((row) => !joinedUserIds.has(row.userId as string)).length,
  };
}

export const heartbeat = mutation({
  args: {
    liveClassId: v.id("liveClasses"),
    phase: lobbyPhaseValidator,
    now: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const now = requireQueryNow(args.now);

    const liveClass = await ctx.db.get(args.liveClassId);
    if (liveClass === null) throw new Error("השיעור לא נמצא");

    const profile = await requireAppProfile(ctx, userId);
    if (viewerIsInstructorForClass(profile, liveClass, userId)) {
      return null;
    }

    const reservations = await ctx.db
      .query("liveReservations")
      .withIndex("by_liveClassId_and_userId", (q) =>
        q.eq("liveClassId", args.liveClassId).eq("userId", userId),
      )
      .take(5);
    const active = reservations.find(
      (row) => row.status === "reserved" || row.status === "joined",
    );
    if (active === undefined) {
      throw new Error("אין הרשמה פעילה לשיעור");
    }

    const displayName = await displayNameForUser(ctx, userId);
    const existing = await ctx.db
      .query("liveLobbyPresence")
      .withIndex("by_liveClassId_and_userId", (q) =>
        q.eq("liveClassId", args.liveClassId).eq("userId", userId),
      )
      .take(1);

    if (existing[0] !== undefined) {
      await ctx.db.patch(existing[0]._id, {
        displayName,
        phase: args.phase,
        lastSeenAt: now,
      });
    } else {
      await ctx.db.insert("liveLobbyPresence", {
        liveClassId: args.liveClassId,
        userId,
        displayName,
        phase: args.phase,
        lastSeenAt: now,
      });
    }

    return null;
  },
});

export const clearLobbyPresence = mutation({
  args: { liveClassId: v.id("liveClasses") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const rows = await ctx.db
      .query("liveLobbyPresence")
      .withIndex("by_liveClassId_and_userId", (q) =>
        q.eq("liveClassId", args.liveClassId).eq("userId", userId),
      )
      .take(1);
    if (rows[0] !== undefined) {
      await ctx.db.delete(rows[0]._id);
    }
    return null;
  },
});

export const getInstructorPanel = query({
  args: {
    liveClassId: v.id("liveClasses"),
    now: v.number(),
  },
  returns: v.union(
    v.null(),
    v.object({
      summary: classRosterSummaryValidator,
      reserved: v.array(rosterMemberValidator),
      joined: v.array(rosterMemberValidator),
      waitingInLobby: v.array(lobbyMemberValidator),
    }),
  ),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const now = requireQueryNow(args.now);
    const liveClass = await ctx.db.get(args.liveClassId);
    if (liveClass === null) return null;

    const profile = await requireAppProfile(ctx, userId);
    if (!viewerIsInstructorForClass(profile, liveClass, userId)) {
      return null;
    }

    const summary = await loadClassRosterSummary(ctx, args.liveClassId, liveClass, now);

    const reservedRows = await ctx.db
      .query("liveReservations")
      .withIndex("by_liveClassId_and_status", (q) =>
        q.eq("liveClassId", args.liveClassId).eq("status", "reserved"),
      )
      .collect();
    const joinedRows = await ctx.db
      .query("liveReservations")
      .withIndex("by_liveClassId_and_status", (q) =>
        q.eq("liveClassId", args.liveClassId).eq("status", "joined"),
      )
      .collect();

    const reserved = await Promise.all(
      reservedRows.map(async (row) => ({
        userId: row.userId,
        displayName: await displayNameForUser(ctx, row.userId),
        status: "reserved" as const,
        reservedAt: row.reservedAt,
        joinedAt: row.joinedAt ?? null,
      })),
    );
    reserved.sort((a, b) => a.reservedAt - b.reservedAt);

    const joinedMembers = await Promise.all(
      joinedRows.map(async (row) => ({
        userId: row.userId,
        displayName: await displayNameForUser(ctx, row.userId),
        status: "joined" as const,
        reservedAt: row.reservedAt,
        joinedAt: row.joinedAt ?? null,
      })),
    );
    joinedMembers.sort((a, b) => (a.joinedAt ?? a.reservedAt) - (b.joinedAt ?? b.reservedAt));

    const staleBefore = now - LOBBY_PRESENCE_STALE_MS;
    const lobbyRows = await ctx.db
      .query("liveLobbyPresence")
      .withIndex("by_liveClassId_and_lastSeenAt", (q) =>
        q.eq("liveClassId", args.liveClassId).gte("lastSeenAt", staleBefore),
      )
      .collect();

    const joinedUserIds = new Set(joinedRows.map((row) => row.userId as string));
    const waitingInLobby = lobbyRows
      .filter((row) => !joinedUserIds.has(row.userId as string))
      .map((row) => ({
        userId: row.userId,
        displayName: row.displayName,
        phase: row.phase,
        lastSeenAt: row.lastSeenAt,
      }))
      .sort((a, b) => b.lastSeenAt - a.lastSeenAt);

    return {
      summary,
      reserved,
      waitingInLobby,
      joined: joinedMembers,
    };
  },
});
