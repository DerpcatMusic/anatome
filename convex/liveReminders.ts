import { internalMutation } from "./_generated/server";

export const processDue = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const due = await ctx.db
      .query("liveReminderEvents")
      .withIndex("by_status_and_sendAt", (q) => q.eq("status", "pending").lte("sendAt", now))
      .take(50);

    // Batch-fetch reservations and liveClasses to avoid N+1
    const reservationIds = [...new Set(due.map((r) => r.reservationId))];
    const liveClassIds = [...new Set(due.map((r) => r.liveClassId))];

    const [reservations, liveClasses] = await Promise.all([
      Promise.all(reservationIds.map((id) => ctx.db.get(id))),
      Promise.all(liveClassIds.map((id) => ctx.db.get(id))),
    ]);

    const reservationMap = new Map(
      reservations.filter((r): r is NonNullable<typeof r> => r !== null).map((r) => [r._id, r])
    );
    const liveClassMap = new Map(
      liveClasses.filter((c): c is NonNullable<typeof c> => c !== null).map((c) => [c._id, c])
    );

    let processed = 0;
    for (const reminder of due) {
      const reservation = reservationMap.get(reminder.reservationId);
      const liveClass = liveClassMap.get(reminder.liveClassId);

      if (
        reservation === undefined ||
        liveClass === undefined ||
        reservation.status === "cancelled" ||
        reservation.status === "refunded" ||
        liveClass.status === "cancelled"
      ) {
        await ctx.db.patch(reminder._id, {
          status: "skipped",
          processedAt: now,
        });
      } else {
        // Provider-neutral for now. Wire email/SMS here when a sender is selected.
        await ctx.db.patch(reminder._id, {
          status: "sent",
          processedAt: now,
        });
      }
      processed += 1;
    }

    return { processed };
  },
});
