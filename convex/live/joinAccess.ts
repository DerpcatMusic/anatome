import type { Id } from "../_generated/dataModel";
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
  const isInstructor =
    profile !== null &&
    (profile.role === "admin" ||
      (profile.role === "instructor" && liveClass.instructorUserId === userId));

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
      return {
        classTitle: liveClass.title,
        snapshot: {
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
      };
    }

    const reservation = await findViewerLiveReservation(ctx, liveClassId, userId);
    if (!isValidLiveReservation(reservation)) {
      return null;
    }
  }

  const inWindow = isInLiveJoinWindow(liveClass, now);
  const canEnter =
    inWindow &&
    liveClass.status !== "ended" &&
    liveClass.status !== "cancelled" &&
    liveClass.status !== "draft" &&
    (isInstructor || liveClass.status === "live");

  return {
    classTitle: liveClass.title,
    snapshot: {
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
  };
}
