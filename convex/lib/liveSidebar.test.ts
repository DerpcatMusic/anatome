import { describe, expect, test } from "bun:test";
import {
  isLiveSidebarEligible,
  isMemberLiveSidebarEligible,
  pickBestSidebarLiveClass,
} from "./liveSidebar";

const baseClass = {
  joinOpensAt: 1_000,
  joinClosesAt: 10_000,
  startsAt: 5_000,
};

describe("liveSidebar", () => {
  test("instructor sees scheduled class in join window", () => {
    expect(
      isLiveSidebarEligible({ ...baseClass, status: "scheduled" }, 2_000),
    ).toBe(true);
  });

  test("member only sees live class in join window", () => {
    expect(
      isMemberLiveSidebarEligible({ ...baseClass, status: "scheduled" }, 2_000),
    ).toBe(false);
    expect(
      isMemberLiveSidebarEligible({ ...baseClass, status: "live" }, 2_000),
    ).toBe(true);
  });

  test("pickBestSidebarLiveClass respects memberView", () => {
    const scheduled = {
      _id: "a" as never,
      title: "A",
      type: "group_live" as const,
      ...baseClass,
      status: "scheduled" as const,
    };
    const live = { ...scheduled, _id: "b" as never, status: "live" as const };

    expect(pickBestSidebarLiveClass([scheduled, live], 2_000, { memberView: true })?._id).toBe(
      "b",
    );
    expect(pickBestSidebarLiveClass([scheduled], 2_000, { memberView: true })).toBeNull();
  });
});
