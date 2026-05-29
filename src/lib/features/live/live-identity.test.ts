import { describe, expect, test } from "bun:test";
import { isClassHostParticipant, isInstructorIdentity } from "./live-identity";

describe("isInstructorIdentity", () => {
  test("matches instructor and admin prefixes", () => {
    expect(isInstructorIdentity("instructor_abc")).toBe(true);
    expect(isInstructorIdentity("admin_xyz")).toBe(true);
    expect(isInstructorIdentity("customer_abc")).toBe(false);
  });
});

describe("isClassHostParticipant", () => {
  test("matches host by user id on any role prefix", () => {
    expect(isClassHostParticipant("customer_host1", "host1", null)).toBe(true);
    expect(isClassHostParticipant("instructor_host1", "host1", null)).toBe(true);
  });

  test("matches broadcast starter", () => {
    expect(isClassHostParticipant("customer_starter", "other", "starter")).toBe(true);
  });

  test("rejects unrelated customers", () => {
    expect(isClassHostParticipant("customer_other", "host1", null)).toBe(false);
  });
});
