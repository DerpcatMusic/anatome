import { internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { LIMITS } from "../lib/constants";
import type { Doc } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

async function processReminder(
  ctx: MutationCtx,
  reminder: Doc<"liveReminderEvents">,
  now: number,
) {
  if (reminder.status !== "pending") return "inactive" as const;

  const [reservation, liveClass] = await Promise.all([
    ctx.db.get(reminder.reservationId),
    ctx.db.get(reminder.liveClassId),
  ]);

  if (
    reservation === null ||
    liveClass === null ||
    reservation.status === "cancelled" ||
    reservation.status === "refunded" ||
    liveClass.status === "cancelled"
  ) {
    await ctx.db.patch(reminder._id, {
      status: "skipped",
      processedAt: now,
    });
    return "skipped" as const;
  }

  await ctx.db.patch(reminder._id, {
    status: "sent",
    processedAt: now,
  });
  return "sent" as const;
}

export const due = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const due = await ctx.db
      .query("liveReminderEvents")
      .withIndex("by_status_and_sendAt", (q) =>
        q.eq("status", "pending").lte("sendAt", now),
      )
      .take(LIMITS.REMINDER_BATCH);

    const reservationIds = [...new Set(due.map((r) => r.reservationId))];
    const liveClassIds = [...new Set(due.map((r) => r.liveClassId))];

    const [reservations, liveClasses] = await Promise.all([
      Promise.all(reservationIds.map((id) => ctx.db.get(id))),
      Promise.all(liveClassIds.map((id) => ctx.db.get(id))),
    ]);

    const reservationMap = new Map(
      reservations
        .filter((r): r is NonNullable<typeof r> => r !== null)
        .map((r) => [r._id, r]),
    );
    const liveClassMap = new Map(
      liveClasses
        .filter((c): c is NonNullable<typeof c> => c !== null)
        .map((c) => [c._id, c]),
    );

    let processed = 0;
    for (const reminder of due) {
      const reservation = reservationMap.get(reminder.reservationId) ?? null;
      const liveClass = liveClassMap.get(reminder.liveClassId) ?? null;
      if (
        reservation === null ||
        liveClass === null ||
        reservation.status === "cancelled" ||
        reservation.status === "refunded" ||
        liveClass.status === "cancelled"
      ) {
        await ctx.db.patch(reminder._id, { status: "skipped", processedAt: now });
      } else {
        await ctx.db.patch(reminder._id, { status: "sent", processedAt: now });
      }
      processed += 1;
    }

    return { processed };
  },
});

export const one = internalMutation({
  args: {
    reminderId: v.id("liveReminderEvents"),
    expectedSendAt: v.number(),
  },
  handler: async (ctx, args) => {
    const reminder = await ctx.db.get(args.reminderId);
    if (reminder === null) return { status: "missing" as const };
    if (reminder.sendAt !== args.expectedSendAt) return { status: "stale" as const };
    const status = await processReminder(ctx, reminder, Date.now());
    return { status };
  },
});
