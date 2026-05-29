import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

describe("horizontal-wheel-scroll", () => {
  it("inverts wheel direction for rtl containers", () => {
    const dir = dirname(fileURLToPath(import.meta.url));
    const source = readFileSync(join(dir, "horizontal-wheel-scroll.ts"), "utf8");
    expect(source).toContain('dir === "rtl" ? -1 : 1');
    expect(source).toContain("horizontalScrollSign(node)");
  });
});
