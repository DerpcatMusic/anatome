import type { MutationCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import { missingRequiredEquipment } from "../lib/equipment";
import { equipmentDisplayLabel } from "../lib/equipmentCatalog";
import { assertInLiveJoinWindow } from "../lib/liveJoin";
import { getAppProfile as getStoredAppProfile } from "../lib/authz";

import type { LiveParticipantRole } from "./joinContract";

export type { LiveParticipantRole };

export type JoinPolicyContext = {
  ctx: MutationCtx;
  userId: Id<"users">;
  profile: Doc<"appProfiles"> | null;
  liveClass: Doc<"liveClasses">;
  now: number;
};

export function parseLiveKitIdentity(identity: string):
  | { role: LiveParticipantRole; userId: Id<"users"> }
  | null {
  const parts = identity.split("_");
  if (parts.length < 2) return null;

  const role = parts[0];
  if (role !== "instructor" && role !== "customer" && role !== "admin") return null;

  return {
    role,
    userId: parts.slice(1).join("_") as Id<"users">,
  };
}

export const getAppProfile = getStoredAppProfile;

export function getParticipantRole({
  userId,
  profile,
  liveClass,
}: Pick<JoinPolicyContext, "userId" | "profile" | "liveClass">): {
  isInstructor: boolean;
  isAdmin: boolean;
  participantRole: LiveParticipantRole;
} {
  const isAdmin = profile?.role === "admin";
  const isInstructor = liveClass.instructorUserId === userId || isAdmin;
  return {
    isInstructor,
    isAdmin,
    participantRole: isAdmin ? "admin" : isInstructor ? "instructor" : "customer",
  };
}

export async function findActiveReservation(
  ctx: MutationCtx,
  liveClassId: Id<"liveClasses">,
  userId: Id<"users">,
): Promise<Doc<"liveReservations"> | null> {
  const reservations = await ctx.db
    .query("liveReservations")
    .withIndex("by_liveClassId_and_userId", (q) =>
      q.eq("liveClassId", liveClassId).eq("userId", userId),
    )
    .take(10);

  return (
    reservations.find((row) => row.status === "joined") ??
    reservations.find((row) => row.status === "reserved") ??
    null
  );
}

export async function checkMemberRequirements({
  ctx,
  userId,
  liveClass,
}: JoinPolicyContext) {
  const memberProfiles = await ctx.db
    .query("memberProfiles")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .take(1);
  const memberProfile = memberProfiles[0] ?? null;
  if (memberProfile === null) throw new Error("נדרש פרופיל אישי");
  const missingEquipment = missingRequiredEquipment(
    memberProfile.equipment,
    liveClass.requiredEquipment,
  );
  if (missingEquipment.length > 0) {
    const items = missingEquipment.map((id) => equipmentDisplayLabel(id)).join(", ");
    throw new Error(`חסר ציוד נדרש: ${items}`);
  }
}

export async function validateBaseJoinEligibility(joinCtx: JoinPolicyContext) {
  const { liveClass, now, profile } = joinCtx;
  if (profile === null) throw new Error("נדרש פרופיל משתמש");

  if (
    liveClass.status === "ended" ||
    liveClass.status === "cancelled" ||
    liveClass.status === "draft"
  ) {
    throw new Error("השיעור אינו זמין");
  }

  assertInLiveJoinWindow(liveClass, now);

  const role = getParticipantRole(joinCtx);
  if (!role.isInstructor && liveClass.status !== "live") {
    throw new Error("השיעור אינו חי");
  }

  return role;
}

export async function validateCustomerJoinEligibility(joinCtx: JoinPolicyContext) {
  const reservation = await findActiveReservation(
    joinCtx.ctx,
    joinCtx.liveClass._id,
    joinCtx.userId,
  );
  await checkMemberRequirements(joinCtx);

  return reservation;
}

export const LIVEKIT_PRIVILEGED_EXTRA_SEATS = 2;

/** Instructor or admin — publish screen share, room admin, etc. */
export function isPrivilegedLiveParticipant(role: LiveParticipantRole): boolean {
  return role === "instructor" || role === "admin";
}

/** LiveKit participant identity: `{role}_{userId}`. */
export function liveKitParticipantIdentity(
  role: LiveParticipantRole,
  userId: Id<"users">,
): string {
  return `${role}_${userId}`;
}

export function liveKitRoomLayout(
  liveClassType: "group_live" | "one_on_one",
): "one_on_one" | "instructor_spotlight" {
  return liveClassType === "one_on_one" ? "one_on_one" : "instructor_spotlight";
}

export function maxLiveKitParticipants(capacity: number) {
  return Math.max(2, capacity + LIVEKIT_PRIVILEGED_EXTRA_SEATS);
}
