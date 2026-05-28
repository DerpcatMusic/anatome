import { describe, expect, test } from "bun:test";
import { classOverlapsCalendarRange } from "./calendarRange";

describe("classOverlapsCalendarRange", () => {
  const from = 1_000;
  const to = 5_000;
  const now = 2_500;

  test("includes scheduled class that starts inside the range", () => {
    expect(
      classOverlapsCalendarRange(
        { startsAt: 2_000, endsAt: 3_000, status: "scheduled" },
        from,
        to,
        now,
      ),
    ).toBe(true);
  });

  test("includes live class that started before range but is still running", () => {
    expect(
      classOverlapsCalendarRange(
        { startsAt: 500, endsAt: 4_000, status: "live" },
        from,
        to,
        now,
      ),
    ).toBe(true);
  });

  test("excludes ended class and classes starting after range", () => {
    expect(
      classOverlapsCalendarRange(
        { startsAt: 500, endsAt: 900, status: "live" },
        from,
        to,
        now,
      ),
    ).toBe(false);
    expect(
      classOverlapsCalendarRange(
        { startsAt: 6_000, endsAt: 7_000, status: "scheduled" },
        from,
        to,
        now,
      ),
    ).toBe(false);
  });
});
