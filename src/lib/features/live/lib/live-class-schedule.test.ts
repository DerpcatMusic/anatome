import { describe, expect, test } from "bun:test";
import {
  buildLiveClassScheduleView,
  formatLessonRemaining,
  getLiveClassSchedulePhase,
  LIVE_CLASS_COUNTDOWN_THRESHOLD_MS,
} from "./live-class-schedule";

const startsAt = Date.parse("2026-05-29T16:00:00.000Z");
const endsAt = Date.parse("2026-05-29T17:00:00.000Z");

describe("live-class-schedule", () => {
  test("phase boundaries", () => {
    expect(getLiveClassSchedulePhase(startsAt, endsAt, startsAt - 1)).toBe("before");
    expect(getLiveClassSchedulePhase(startsAt, endsAt, startsAt)).toBe("during");
    expect(getLiveClassSchedulePhase(startsAt, endsAt, endsAt - 1)).toBe("during");
    expect(getLiveClassSchedulePhase(startsAt, endsAt, endsAt)).toBe("ended");
  });

  test("before start shows start cue and range", () => {
    const view = buildLiveClassScheduleView(startsAt, endsAt, startsAt - 60_000);
    expect(view?.phase).toBe("before");
    expect(view?.label).toMatch(/^מתחיל ב־/);
    expect(view?.timeRange).toContain("–");
    expect(view?.progress).toBeNull();
    expect(view?.countdown).toBeNull();
  });

  test("during lesson shows end cue and progress", () => {
    const mid = startsAt + (endsAt - startsAt) / 2;
    const view = buildLiveClassScheduleView(startsAt, endsAt, mid);
    expect(view?.phase).toBe("during");
    expect(view?.label).toMatch(/^עד /);
    expect(view?.progress).toBeCloseTo(0.5, 5);
  });

  test("countdown appears only near lesson end", () => {
    const far = buildLiveClassScheduleView(
      startsAt,
      endsAt,
      endsAt - LIVE_CLASS_COUNTDOWN_THRESHOLD_MS - 1_000,
    );
    expect(far?.countdown).toBeNull();

    const near = buildLiveClassScheduleView(startsAt, endsAt, endsAt - 5 * 60_000);
    expect(near?.countdown).toMatch(/^\d{2}:\d{2}$/);
  });

  test("after end returns null", () => {
    expect(buildLiveClassScheduleView(startsAt, endsAt, endsAt)).toBeNull();
  });

  test("formatLessonRemaining is tabular", () => {
    expect(formatLessonRemaining(90_500)).toBe("01:31");
    expect(formatLessonRemaining(3_661_000)).toBe("1:01:01");
  });
});
