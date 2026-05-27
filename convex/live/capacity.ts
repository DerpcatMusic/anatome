import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

const MAX_SEAT_ATTEMPTS = 8;

async function countHeldSeats(
  ctx: MutationCtx,
  liveClassId: Id<"liveClasses">,
): Promise<number> {
  const reserved = await ctx.db
    .query("liveReservations")
    .withIndex("by_liveClassId_and_status", (q) =>
      q.eq("liveClassId", liveClassId).eq("status", "reserved"),
    )
    .collect();
  const joined = await ctx.db
    .query("liveReservations")
    .withIndex("by_liveClassId_and_status", (q) =>
      q.eq("liveClassId", liveClassId).eq("status", "joined"),
    )
    .collect();
  return reserved.length + joined.length;
}

export async function reserveClassSeat(
  ctx: MutationCtx,
  liveClassId: Id<"liveClasses">,
) {
  for (let attempt = 0; attempt < MAX_SEAT_ATTEMPTS; attempt += 1) {
    const liveClass = await ctx.db.get(liveClassId);
    if (liveClass === null) {
      throw new Error("השיעור לא נמצא");
    }

    const heldSeats = await countHeldSeats(ctx, liveClassId);
    if (heldSeats >= liveClass.capacity) {
      throw new Error("השיעור מלא");
    }

    const seatsTaken = liveClass.seatsTaken ?? 0;
    const nextSeatsTaken = Math.max(seatsTaken, heldSeats) + 1;
    if (nextSeatsTaken > liveClass.capacity) {
      throw new Error("השיעור מלא");
    }

    await ctx.db.patch(liveClassId, { seatsTaken: nextSeatsTaken });
    return;
  }

  throw new Error("לא ניתן להשלים את ההרשמה, נסו שוב");
}

export async function releaseClassSeats(
  ctx: MutationCtx,
  liveClassId: Id<"liveClasses">,
  count: number = 1,
) {
  if (count <= 0) return;

  const liveClass = await ctx.db.get(liveClassId);
  if (liveClass === null) return;

  const heldSeats = await countHeldSeats(ctx, liveClassId);
  await ctx.db.patch(liveClassId, {
    seatsTaken: Math.max(0, Math.max(liveClass.seatsTaken ?? 0, heldSeats) - count),
  });
}
