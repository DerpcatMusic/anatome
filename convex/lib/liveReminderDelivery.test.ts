import { describe, expect, test } from "bun:test";
import { shouldSkipLiveReminderDelivery } from "./liveReminderDelivery";

const baseReservation = {
  status: "reserved" as const,
};
const baseClass = {
  status: "scheduled" as const,
};

describe("shouldSkipLiveReminderDelivery", () => {
  test("skips missing rows", () => {
    expect(shouldSkipLiveReminderDelivery(null, baseClass as never)).toBe(true);
    expect(shouldSkipLiveReminderDelivery(baseReservation as never, null)).toBe(true);
  });

  test("skips terminal reservation and class states", () => {
    expect(
      shouldSkipLiveReminderDelivery(
        { ...baseReservation, status: "cancelled" } as never,
        baseClass as never,
      ),
    ).toBe(true);
    expect(
      shouldSkipLiveReminderDelivery(
        { ...baseReservation, status: "no_show" } as never,
        baseClass as never,
      ),
    ).toBe(true);
    expect(
      shouldSkipLiveReminderDelivery(
        baseReservation as never,
        { ...baseClass, status: "ended" } as never,
      ),
    ).toBe(true);
  });

  test("delivers for active reserved + scheduled", () => {
    expect(
      shouldSkipLiveReminderDelivery(baseReservation as never, baseClass as never),
    ).toBe(false);
  });
});
