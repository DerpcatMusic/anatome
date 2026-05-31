import { describe, expect, test } from "bun:test";
import {
  canHostStartBroadcast,
  isBroadcastActive,
  showHostPublishSettings,
} from "./preconnect-ui";
import type { JoinAccessSnapshot } from "../join-token";

const baseAccess: JoinAccessSnapshot = {
  joinOpensAt: 0,
  joinClosesAt: 10_000,
  startsAt: 5_000,
  status: "scheduled",
  canEnter: true,
  minutesUntilOpen: null,
  minutesUntilClose: null,
  isInstructor: true,
  equipmentBlocked: false,
  isBroadcastLive: false,
  instructorUserId: "users:test" as JoinAccessSnapshot["instructorUserId"],
  instructorName: "Test Instructor",
  subscriberReceivePreset: "medium",
};

describe("preconnect-ui", () => {
  test("host can start when scheduled", () => {
    expect(
      canHostStartBroadcast(true, true, { ...baseAccess, status: "scheduled" }, "prep"),
    ).toBe(true);
  });

  test("host can start when live but broadcast not started", () => {
    expect(
      canHostStartBroadcast(
        true,
        true,
        { ...baseAccess, status: "live", isBroadcastLive: false },
        "ready",
      ),
    ).toBe(true);
  });

  test("host re-enters when broadcast is active", () => {
    expect(
      canHostStartBroadcast(
        true,
        true,
        { ...baseAccess, status: "live", isBroadcastLive: true },
        "ready",
      ),
    ).toBe(false);
  });

  test("publish panel hidden after broadcast starts", () => {
    expect(showHostPublishSettings(true, false)).toBe(false);
    expect(showHostPublishSettings(true, true)).toBe(true);
  });

  test("isBroadcastActive requires live status and flag", () => {
    expect(isBroadcastActive({ ...baseAccess, status: "live", isBroadcastLive: true })).toBe(
      true,
    );
    expect(isBroadcastActive({ ...baseAccess, status: "live", isBroadcastLive: false })).toBe(
      false,
    );
  });
});
