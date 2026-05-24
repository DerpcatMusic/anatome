import { api } from "$convex/_generated/api";
import type { useConvexClient } from "convex-svelte";
import { RULES } from "$convex/lib/constants";
import {
  mergeRanges,
  type AvailabilityRule,
  type PaintedSlots,
} from "./one-on-one-availability";

type ConvexClient = ReturnType<typeof useConvexClient>;

export async function saveAvailabilityFromPainted(
  client: ConvexClient,
  painted: PaintedSlots,
  rules: AvailabilityRule[],
): Promise<void> {
  const slotMinutes = RULES.ONE_ON_ONE_DURATION_MINUTES;
  const bufferMinutes = RULES.ONE_ON_ONE_BUFFER_MINUTES;
  for (let weekday = 0; weekday < 7; weekday += 1) {
    const indices = [...(painted[weekday] ?? [])];
    const desiredRanges = mergeRanges(indices);
    const dayRules = rules.filter((r) => r.weekday === weekday);

    for (const rule of dayRules) {
      const stillWanted = desiredRanges.some(
        (r) => r.startMinute === rule.startMinute && r.endMinute === rule.endMinute,
      );
      if (!stillWanted && rule.isActive) {
        await client.mutation(api.oneOnOne.instructor.setAvailabilityRule, {
          ruleId: rule._id,
          weekday: rule.weekday,
          startMinute: rule.startMinute,
          endMinute: rule.endMinute,
          slotMinutes: rule.slotMinutes,
          bufferMinutes: rule.bufferMinutes,
          isActive: false,
        });
      }
    }

    for (const range of desiredRanges) {
      const existing = dayRules.find(
        (r) => r.startMinute === range.startMinute && r.endMinute === range.endMinute,
      );
      await client.mutation(api.oneOnOne.instructor.setAvailabilityRule, {
        ruleId: existing?._id,
        weekday,
        startMinute: range.startMinute,
        endMinute: range.endMinute,
        slotMinutes,
        bufferMinutes,
        isActive: true,
      });
    }
  }
}
