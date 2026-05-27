import { describe, expect, test } from "bun:test";
import { goalDisplayLabel, normalizeGoalList } from "./goalCatalog";

describe("goalCatalog", () => {
  test("deduplicates and filters invalid goal ids", () => {
    expect(
      normalizeGoalList([
        "pelvic_floor_rehab",
        "pelvic_floor_rehab",
        "strength",
        "not_a_goal",
      ]),
    ).toEqual(["pelvic_floor_rehab", "strength"]);
  });

  test("labels legacy and canonical goals", () => {
    expect(goalDisplayLabel("pelvic_floor_rehab")).toBe("שיקום רצפת אגן");
    expect(goalDisplayLabel("strength")).toBe("כוח");
    expect(goalDisplayLabel("unknown")).toBe("unknown");
  });
});
