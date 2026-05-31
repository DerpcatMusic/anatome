import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { getAppProfile, isStaff } from "./authz";

export function isValidLiveReservation(
  reservation: Doc<"liveReservations"> | null | undefined,
): boolean {
  return (
    reservation !== null &&
    reservation !== undefined &&
    (reservation.status === "reserved" || reservation.status === "joined")
  );
}

export function findViewerLiveReservationFromRows(
  reservations: Doc<"liveReservations">[],
  liveClassId: Id<"liveClasses">,
): Doc<"liveReservations"> | null {
  return (
    reservations.find(
      (row) => row.liveClassId === liveClassId && row.status === "joined",
    ) ??
    reservations.find(
      (row) => row.liveClassId === liveClassId && row.status === "reserved",
    ) ??
    null
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

  return findViewerLiveReservationFromRows(reservations, liveClassId);
}

/** Latest terminal reservation row to reactivate after user cancel / no-show. */
export function findReactivatableReservation(
  reservations: Doc<"liveReservations">[],
  liveClassId: Id<"liveClasses">,
): Doc<"liveReservations"> | null {
  const terminal = reservations.filter(
    (row) =>
      row.liveClassId === liveClassId &&
      (row.status === "cancelled" || row.status === "no_show"),
  );
  if (terminal.length === 0) return null;
  return terminal.reduce((latest, row) =>
    row.reservedAt > latest.reservedAt ? row : latest,
  );
}

export async function viewerIsLiveStaff(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
): Promise<boolean> {
  return isStaff(await getAppProfile(ctx, userId));
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
