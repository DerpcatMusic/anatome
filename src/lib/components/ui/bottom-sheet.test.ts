import { describe, expect, test } from "bun:test";
import { resolveSnapAfterDrag, translateYForSnap } from "./bottom-sheet.svelte";

describe("bottom-sheet snap", () => {
  test("translateY increases when dragging down", () => {
    const sheetHeight = 600;
    const viewportHeight = 800;
    const atHalf = translateYForSnap("half", sheetHeight, viewportHeight, 0);
    const dragged = translateYForSnap("half", sheetHeight, viewportHeight, 80);
    expect(dragged).toBeGreaterThan(atHalf);
  });

  test("tap without drag keeps current snap", () => {
    const next = resolveSnapAfterDrag({
      sheetHeight: 600,
      viewportHeight: 800,
      currentSnap: "half",
      dragOffsetPx: 0,
      velocityY: 0,
      didDrag: false,
    });
    expect(next).toBe("half");
  });

  test("unmeasured height does not dismiss on release", () => {
    const next = resolveSnapAfterDrag({
      sheetHeight: 0,
      viewportHeight: 800,
      currentSnap: "half",
      dragOffsetPx: 0,
      velocityY: 0,
      didDrag: true,
    });
    expect(next).toBe("half");
  });

  test("fast downward flick dismisses from half", () => {
    const next = resolveSnapAfterDrag({
      sheetHeight: 600,
      viewportHeight: 800,
      currentSnap: "half",
      dragOffsetPx: 0,
      velocityY: 0.6,
      didDrag: true,
    });
    expect(next).toBe("closed");
  });
});
