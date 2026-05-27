import { describe, expect, test } from "bun:test";
import {
  memberProfileNeedsUpdate,
  normalizeDisplayName,
  normalizeStoredMemberProfile,
} from "./normalizeStoredProfile";

describe("normalizeStoredMemberProfile", () => {
  test("normalizes legacy equipment and filters invalid goals", () => {
    const normalized = normalizeStoredMemberProfile({
      equipment: ["mat", "barrel", "spine_corrector"],
      goals: ["strength", "invalid", "pelvic_floor_rehab"],
      pathologies: ["back_pain", "back_pain", "nope"],
      notes: "  hello  ",
      experience: "some",
    });
    expect(normalized.equipment).toEqual(["mat", "spine_corrector"]);
    expect(normalized.goals).toEqual(["strength", "pelvic_floor_rehab"]);
    expect(normalized.pathologies).toEqual(["back_pain"]);
    expect(normalized.notes).toBe("hello");
  });

  test("detects when a stored profile still needs patching", () => {
    const profile = {
      equipment: ["barrel"],
      goals: ["strength"],
      pathologies: ["back_pain"],
      notes: "x",
      experience: "some" as const,
    };
    const normalized = normalizeStoredMemberProfile(profile);
    expect(memberProfileNeedsUpdate(profile as never, normalized)).toBe(true);
  });
});

describe("normalizeDisplayName", () => {
  test("trims and collapses whitespace", () => {
    expect(normalizeDisplayName("  מיה   כהן  ")).toBe("מיה כהן");
  });
});
