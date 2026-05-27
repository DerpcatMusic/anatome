import type { MutationCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import { roomNameForClass } from "./live";

function roomPriority(room: Doc<"liveRooms">): number {
  if (room.status === "active") return 0;
  if (room.status === "pending") return 1;
  return 2;
}

function pickCanonicalRoom(rooms: Doc<"liveRooms">[]): Doc<"liveRooms"> {
  return [...rooms].sort((a, b) => {
    const byStatus = roomPriority(a) - roomPriority(b);
    if (byStatus !== 0) return byStatus;
    const aStarted = a.startedAt ?? Number.MAX_SAFE_INTEGER;
    const bStarted = b.startedAt ?? Number.MAX_SAFE_INTEGER;
    if (aStarted !== bStarted) return aStarted - bStarted;
    return a._id.localeCompare(b._id);
  })[0];
}

async function dedupeLiveRooms(
  ctx: MutationCtx,
  liveClassId: Id<"liveClasses">,
  now: number,
): Promise<Doc<"liveRooms"> | null> {
  const rooms = await ctx.db
    .query("liveRooms")
    .withIndex("by_liveClassId", (q) => q.eq("liveClassId", liveClassId))
    .collect();

  if (rooms.length === 0) return null;

  const canonical = pickCanonicalRoom(rooms);
  for (const duplicate of rooms) {
    if (duplicate._id === canonical._id) continue;
    await ctx.db.delete(duplicate._id);
  }

  const canonicalRoomName = roomNameForClass(liveClassId);
  if (canonical.roomName !== canonicalRoomName || canonical.status !== "active") {
    await ctx.db.patch(canonical._id, {
      roomName: canonicalRoomName,
      status: "active",
      startedAt: canonical.startedAt ?? now,
      updatedAt: now,
    });
    const refreshed = await ctx.db.get(canonical._id);
    return refreshed;
  }

  return canonical;
}

/** One active LiveKit room row per class; safe under concurrent inserts. */
export async function ensureLiveRoomForClass(
  ctx: MutationCtx,
  liveClassId: Id<"liveClasses">,
  now: number,
  options?: { startedByUserId?: Id<"users"> },
): Promise<Doc<"liveRooms">> {
  const canonicalRoomName = roomNameForClass(liveClassId);

  let room = await dedupeLiveRooms(ctx, liveClassId, now);
  if (room !== null) {
    if (options?.startedByUserId !== undefined && room.startedByUserId === undefined) {
      await ctx.db.patch(room._id, {
        startedByUserId: options.startedByUserId,
        updatedAt: now,
      });
      const refreshed = await ctx.db.get(room._id);
      if (refreshed === null) throw new Error("Room update failed");
      return refreshed;
    }
    return room;
  }

  const roomId = await ctx.db.insert("liveRooms", {
    liveClassId,
    provider: "livekit",
    roomName: canonicalRoomName,
    status: "active",
    startedAt: now,
    updatedAt: now,
    ...(options?.startedByUserId !== undefined
      ? { startedByUserId: options.startedByUserId }
      : {}),
  });

  room = await dedupeLiveRooms(ctx, liveClassId, now);
  if (room !== null) return room;

  const inserted = await ctx.db.get(roomId);
  if (inserted === null) throw new Error("Room creation failed");
  return inserted;
}
