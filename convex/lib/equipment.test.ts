import { describe, expect, test } from "bun:test";
import {
  missingRequiredEquipment,
  viewerCanAccessLiveClass,
} from "./equipment";

describe("viewerCanAccessLiveClass", () => {
  test("passes when member owns a superset of required equipment", () => {
    expect(viewerCanAccessLiveClass(["mat", "reformer"], ["mat"])).toBe(true);
  });

  test("fails when member is missing a required item", () => {
    expect(viewerCanAccessLiveClass(["mat"], ["mat", "reformer"])).toBe(false);
    expect(missingRequiredEquipment(["mat"], ["mat", "reformer"])).toEqual(["reformer"]);
  });

  test("normalizes legacy barrel alias to spine_corrector", () => {
    expect(viewerCanAccessLiveClass(["barrel"], ["spine_corrector"])).toBe(true);
  });

  test("normalizes mixed storage ids on class and profile", () => {
    expect(viewerCanAccessLiveClass(["mat", "barrel"], ["mat", "spine_corrector"])).toBe(
      true,
    );
  });

  test("empty class requirement imposes no equipment gate", () => {
    expect(viewerCanAccessLiveClass([], ["mat"])).toBe(false);
    expect(viewerCanAccessLiveClass(["mat"], [])).toBe(true);
  });
});
