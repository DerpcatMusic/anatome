import { describe, expect, test } from "bun:test";
import { bucketQueryNowMs, QUERY_NOW_CALENDAR_BUCKET_MS } from "./queryClockBucket";

describe("bucketQueryNowMs", () => {
  test("snaps to bucket boundary", () => {
    const bucket = QUERY_NOW_CALENDAR_BUCKET_MS;
    const now = bucket * 3 + 45_000;
    expect(bucketQueryNowMs(now)).toBe(bucket * 3);
  });
});
