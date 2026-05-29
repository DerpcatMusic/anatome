import { describe, expect, test } from "bun:test";
import { isEmailLike, preferredMemberDisplayName } from "./memberDisplay";

describe("member display", () => {
  test("detects email-like strings", () => {
    expect(isEmailLike("user@example.com")).toBe(true);
    expect(isEmailLike("מיה כהן")).toBe(false);
    expect(isEmailLike("Maya Cohen")).toBe(false);
  });

  test("prefers real names over email profile fields", () => {
    expect(
      preferredMemberDisplayName(
        { displayName: "user@example.com" },
        { name: "user@example.com" },
      ),
    ).toBe("משתתפת");
    expect(
      preferredMemberDisplayName({ displayName: "מיה כהן" }, { name: "user@example.com" }),
    ).toBe("מיה כהן");
  });
});
