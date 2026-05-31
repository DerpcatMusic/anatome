import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { RULES } from "../lib/constants";
import { minuteMs } from "../lib/oneOnOne";
import { scheduleLiveClassLifecycle } from "../live/schedule";

const ONE_ON_ONE_JOIN_OPENS_BEFORE_MS = 15 * minuteMs;
const DEFAULT_ONE_ON_ONE_EQUIPMENT = ["mat"] as const;

export async function createScheduledOneOnOneClass(
  ctx: MutationCtx,
  input: {
    instructorUserId: Id<"users">;
    startsAt: number;
    endsAt: number;
    title: string;
    description: string;
    seatsTaken: number;
    now: number;
  },
) {
  const joinOpensAt = input.startsAt - ONE_ON_ONE_JOIN_OPENS_BEFORE_MS;
  const liveClassId = await ctx.db.insert("liveClasses", {
    title: input.title,
    description: input.description,
    type: "one_on_one",
    instructorUserId: input.instructorUserId,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    joinOpensAt,
    joinClosesAt: input.endsAt,
    capacity: 1,
    requiredEquipment: [...DEFAULT_ONE_ON_ONE_EQUIPMENT],
    creditKind: "oneOnOne",
    creditCost: RULES.DEFAULT_CREDIT_COST,
    status: "scheduled",
    seatsTaken: input.seatsTaken,
    createdAt: input.now,
    updatedAt: input.now,
  });
  const scheduled = await scheduleLiveClassLifecycle(
    ctx,
    liveClassId,
    input.startsAt,
    joinOpensAt,
    input.endsAt,
  );
  await ctx.db.patch(liveClassId, scheduled);
  return liveClassId;
}
