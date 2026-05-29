import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { requireUserId, requireAppProfile } from "../lib/authz";
import { LOBBY_PRESENCE_STALE_MS } from "../lib/constants";
import { loadMemberPublicProfiles, memberPublicProfileForUser } from "../lib/memberDisplay";
import { requireQueryNow } from "../lib/queryNow";
import {
  findViewerLiveReservation,
  isValidLiveReservation,
} from "../lib/liveClassAccess";
import { viewerIsInstructorForClass } from "./joinAccess";

const lobbyPhaseValidator = v.union(
  v.literal("waiting_broadcast"),
  v.literal("device_setup"),
);

const rosterMemberValidator = v.object({
  userId: v.id("users"),
  displayName: v.string(),
  avatarUrl: v.union(v.string(), v.null()),
  status: v.union(v.literal("reserved"), v.literal("joined")),
  reservedAt: v.number(),
  joinedAt: v.union(v.number(), v.null()),
});

const lobbyMemberValidator = v.object({
  userId: v.id("users"),
  displayName: v.string(),
  avatarUrl: v.union(v.string(), v.null()),
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

    const { displayName } = await memberPublicProfileForUser(ctx, userId);
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

    const staleBefore = now - LOBBY_PRESENCE_STALE_MS;
    const lobbyRows = await ctx.db
      .query("liveLobbyPresence")
      .withIndex("by_liveClassId_and_lastSeenAt", (q) =>
        q.eq("liveClassId", args.liveClassId).gte("lastSeenAt", staleBefore),
      )
      .collect();

    const memberProfiles = await loadMemberPublicProfiles(ctx, [
      ...reservedRows.map((row) => row.userId),
      ...joinedRows.map((row) => row.userId),
      ...lobbyRows.map((row) => row.userId),
    ]);

    const memberLabel = (userId: Id<"users">) =>
      memberProfiles.get(userId as string) ?? {
        displayName: "משתתפת",
        avatarUrl: null,
      };

    const reserved = reservedRows
      .map((row) => {
        const member = memberLabel(row.userId);
        return {
          userId: row.userId,
          displayName: member.displayName,
          avatarUrl: member.avatarUrl,
          status: "reserved" as const,
          reservedAt: row.reservedAt,
          joinedAt: row.joinedAt ?? null,
        };
      })
      .sort((a, b) => a.reservedAt - b.reservedAt);

    const joinedMembers = joinedRows
      .map((row) => {
        const member = memberLabel(row.userId);
        return {
          userId: row.userId,
          displayName: member.displayName,
          avatarUrl: member.avatarUrl,
          status: "joined" as const,
          reservedAt: row.reservedAt,
          joinedAt: row.joinedAt ?? null,
        };
      })
      .sort((a, b) => (a.joinedAt ?? a.reservedAt) - (b.joinedAt ?? b.reservedAt));

    const joinedUserIds = new Set(joinedRows.map((row) => row.userId as string));
    const waitingInLobby = lobbyRows
      .filter((row) => !joinedUserIds.has(row.userId as string))
      .map((row) => {
        const member = memberLabel(row.userId);
        return {
          userId: row.userId,
          displayName: member.displayName,
          avatarUrl: member.avatarUrl,
          phase: row.phase,
          lastSeenAt: row.lastSeenAt,
        };
      })
      .sort((a, b) => b.lastSeenAt - a.lastSeenAt);

    return {
      summary,
      reserved,
      waitingInLobby,
      joined: joinedMembers,
    };
  },
});

const memberPanelHostValidator = v.object({
  userId: v.id("users"),
  displayName: v.string(),
  avatarUrl: v.union(v.string(), v.null()),
});

const memberPanelAttendeeValidator = v.object({
  userId: v.id("users"),
  displayName: v.string(),
  avatarUrl: v.union(v.string(), v.null()),
  reservationStatus: v.union(v.literal("reserved"), v.literal("joined")),
});

export const getMemberPanel = query({
  args: {
    liveClassId: v.id("liveClasses"),
    now: v.number(),
  },
  returns: v.union(
    v.null(),
    v.object({
      host: memberPanelHostValidator,
      attendees: v.array(memberPanelAttendeeValidator),
    }),
  ),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    requireQueryNow(args.now);
    const liveClass = await ctx.db.get(args.liveClassId);
    if (liveClass === null) return null;

    const profile = await requireAppProfile(ctx, userId);
    if (viewerIsInstructorForClass(profile, liveClass, userId)) {
      return null;
    }

    const reservation = await findViewerLiveReservation(ctx, args.liveClassId, userId);
    if (!isValidLiveReservation(reservation)) {
      return null;
    }

    const hostProfile = await memberPublicProfileForUser(ctx, liveClass.instructorUserId);

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

    const attendeeUserIds = [
      ...reservedRows.map((row) => row.userId),
      ...joinedRows.map((row) => row.userId),
    ].filter(
      (id) =>
        (id as string) !== (userId as string) &&
        (id as string) !== (liveClass.instructorUserId as string),
    );

    const memberProfiles = await loadMemberPublicProfiles(ctx, attendeeUserIds);

    const byUser = new Map<
      string,
      { userId: Id<"users">; reservationStatus: "reserved" | "joined"; sortKey: number }
    >();
    for (const row of reservedRows) {
      if (row.userId === userId || row.userId === liveClass.instructorUserId) continue;
      byUser.set(row.userId as string, {
        userId: row.userId,
        reservationStatus: "reserved",
        sortKey: row.reservedAt,
      });
    }
    for (const row of joinedRows) {
      if (row.userId === userId || row.userId === liveClass.instructorUserId) continue;
      byUser.set(row.userId as string, {
        userId: row.userId,
        reservationStatus: "joined",
        sortKey: row.joinedAt ?? row.reservedAt,
      });
    }

    const attendees = [...byUser.values()]
      .map((entry) => {
        const member = memberProfiles.get(entry.userId as string) ?? {
          displayName: "משתתפת",
          avatarUrl: null,
        };
        return {
          userId: entry.userId,
          displayName: member.displayName,
          avatarUrl: member.avatarUrl,
          reservationStatus: entry.reservationStatus,
        };
      })
      .sort((a, b) => {
        const joinedDelta =
          Number(b.reservationStatus === "joined") - Number(a.reservationStatus === "joined");
        if (joinedDelta !== 0) return joinedDelta;
        return a.displayName.localeCompare(b.displayName, "he");
      });

    return {
      host: {
        userId: liveClass.instructorUserId,
        displayName: hostProfile.displayName,
        avatarUrl: hostProfile.avatarUrl,
      },
      attendees,
    };
  },
});
