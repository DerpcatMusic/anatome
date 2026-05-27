import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export function isValidLiveReservation(
  reservation: Doc<"liveReservations"> | null | undefined,
): boolean {
  return (
    reservation !== null &&
    reservation !== undefined &&
    (reservation.status === "reserved" || reservation.status === "joined")
  );
}

export async function findViewerLiveReservation(
  ctx: QueryCtx | MutationCtx,
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

export async function viewerIsLiveStaff(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
): Promise<boolean> {
  const profiles = await ctx.db
    .query("appProfiles")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .take(1);
  const profile = profiles[0] ?? null;
  return profile !== null && (profile.role === "instructor" || profile.role === "admin");
}

export async function viewerCanSeeLiveClass(
  ctx: QueryCtx | MutationCtx,
  liveClass: Doc<"liveClasses">,
  userId: Id<"users"> | null,
): Promise<boolean> {
  if (liveClass.type === "group_live") return true;
  if (userId === null) return false;
  if (await viewerIsLiveStaff(ctx, userId)) return true;
  const reservation = await findViewerLiveReservation(ctx, liveClass._id, userId);
  return isValidLiveReservation(reservation);
}
