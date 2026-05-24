import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

export async function reserveClassSeat(
  ctx: MutationCtx,
  liveClassId: Id<"liveClasses">,
) {
  const liveClass = await ctx.db.get(liveClassId);
  if (liveClass === null) {
    throw new Error("השיעור לא נמצא");
  }

  const seatsTaken = liveClass.seatsTaken ?? 0;
  if (seatsTaken >= liveClass.capacity) {
    throw new Error("השיעור מלא");
  }

  await ctx.db.patch(liveClassId, { seatsTaken: seatsTaken + 1 });
}

export async function releaseClassSeats(
  ctx: MutationCtx,
  liveClassId: Id<"liveClasses">,
  count: number = 1,
) {
  if (count <= 0) return;

  const liveClass = await ctx.db.get(liveClassId);
  if (liveClass === null) return;

  await ctx.db.patch(liveClassId, {
    seatsTaken: Math.max(0, (liveClass.seatsTaken ?? 0) - count),
  });
}
