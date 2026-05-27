import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { viewerCanAccessLiveClass } from "../lib/equipment";
import {
  findViewerLiveReservation,
  isValidLiveReservation,
} from "../lib/liveClassAccess";
import {
  isInLiveJoinWindow,
  minutesUntilJoinCloses,
  minutesUntilJoinOpens,
} from "../lib/liveJoin";
import { requireQueryNow } from "../lib/queryNow";
import type { JoinAccessSnapshot } from "./joinContract";

export type JoinAccessResolveResult = {
  snapshot: JoinAccessSnapshot;
  classTitle: string;
};

export async function broadcastMetaForClass(
  ctx: QueryCtx,
  liveClassId: Id<"liveClasses">,
  status: Doc<"liveClasses">["status"],
): Promise<Pick<JoinAccessSnapshot, "isBroadcastLive" | "broadcastStartedByUserId">> {
  if (status !== "live") {
    return { isBroadcastLive: false };
  }
  const rooms = await ctx.db
    .query("liveRooms")
    .withIndex("by_liveClassId", (q) => q.eq("liveClassId", liveClassId))
    .take(1);
  const room = rooms[0] ?? null;
  if (room === null || room.status !== "active" || room.startedByUserId === undefined) {
    return { isBroadcastLive: false };
  }
  return {
    isBroadcastLive: true,
    broadcastStartedByUserId: room.startedByUserId,
  };
}

/** Instructor or admin for this class (may enter before broadcast). */
export function viewerIsInstructorForClass(
  profile: Doc<"appProfiles"> | null,
  liveClass: Pick<Doc<"liveClasses">, "instructorUserId">,
  userId: Id<"users">,
): boolean {
  return (
    profile !== null &&
    (profile.role === "admin" ||
      (profile.role === "instructor" && liveClass.instructorUserId === userId))
  );
}

function withBroadcastMeta(
  snapshot: Omit<
    JoinAccessSnapshot,
    "isBroadcastLive" | "broadcastStartedByUserId" | "subscriberReceivePreset"
  >,
  broadcast: Pick<JoinAccessSnapshot, "isBroadcastLive" | "broadcastStartedByUserId">,
  liveClass: Doc<"liveClasses">,
): JoinAccessSnapshot {
  return {
    ...snapshot,
    ...broadcast,
    subscriberReceivePreset: liveClass.subscriberReceivePreset ?? "medium",
  };
}

/**
 * Shared pre-flight join gate for `getJoinAccess` and `getJoinContext`.
 * Returns `null` when the viewer cannot see this class (auth, reservation, profile).
 */
export async function resolveJoinAccess(
  ctx: QueryCtx,
  liveClassId: Id<"liveClasses">,
  nowArg: number,
): Promise<JoinAccessResolveResult | null> {
  const now = requireQueryNow(nowArg);
  const userId = await getAuthUserId(ctx);
  if (userId === null) return null;

  const liveClass = await ctx.db.get(liveClassId);
  if (liveClass === null) return null;
  if (liveClass.type !== "group_live" && liveClass.type !== "one_on_one") {
    return null;
  }

  const profiles = await ctx.db
    .query("appProfiles")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .take(1);
  const profile = profiles[0] ?? null;
  const isInstructor = viewerIsInstructorForClass(profile, liveClass, userId);

  if (!isInstructor) {
    const memberProfiles = await ctx.db
      .query("memberProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .take(1);
    const memberProfile = memberProfiles[0] ?? null;
    if (memberProfile === null) return null;
    const equipmentBlocked = !viewerCanAccessLiveClass(
      memberProfile.equipment,
      liveClass.requiredEquipment,
    );
    if (equipmentBlocked) {
      const broadcast = await broadcastMetaForClass(ctx, liveClassId, liveClass.status);
      return {
        classTitle: liveClass.title,
        snapshot: withBroadcastMeta(
          {
            joinOpensAt: liveClass.joinOpensAt,
            joinClosesAt: liveClass.joinClosesAt,
            startsAt: liveClass.startsAt,
            status: liveClass.status,
            canEnter: false,
            minutesUntilOpen: minutesUntilJoinOpens(liveClass, now),
            minutesUntilClose: minutesUntilJoinCloses(liveClass, now),
            isInstructor: false,
            equipmentBlocked: true,
          },
          broadcast,
          liveClass,
        ),
      };
    }

    const reservation = await findViewerLiveReservation(ctx, liveClassId, userId);
    if (!isValidLiveReservation(reservation)) {
      return null;
    }
  }

  const inWindow = isInLiveJoinWindow(liveClass, now);
  const broadcast = await broadcastMetaForClass(ctx, liveClassId, liveClass.status);
  const canEnter =
    inWindow &&
    liveClass.status !== "ended" &&
    liveClass.status !== "cancelled" &&
    liveClass.status !== "draft" &&
    (isInstructor || (liveClass.status === "live" && broadcast.isBroadcastLive));

  return {
    classTitle: liveClass.title,
    snapshot: withBroadcastMeta(
      {
        joinOpensAt: liveClass.joinOpensAt,
        joinClosesAt: liveClass.joinClosesAt,
        startsAt: liveClass.startsAt,
        status: liveClass.status,
        canEnter,
        minutesUntilOpen: minutesUntilJoinOpens(liveClass, now),
        minutesUntilClose: minutesUntilJoinCloses(liveClass, now),
        isInstructor,
        equipmentBlocked: false,
      },
      broadcast,
      liveClass,
    ),
  };
}
