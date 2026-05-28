import { describe, expect, test } from "bun:test";
import { buildLandingCopyMarkdown } from "./landing-copy-export";
import { parseLandingCopyMarkdown } from "./landing-copy-parse";
import { resolveLandingCopyValue } from "./landing-copy-resolve";

describe("landing copy export", () => {
  test("markdown includes known slug and round-trips", () => {
    const md = buildLandingCopyMarkdown();
    expect(md).toContain("מזהה: `landing.hero.lead`");
    expect(md).toContain("```text");
    expect(md).toContain("על יובל — הביוגרפיה");

    const parsed = parseLandingCopyMarkdown(md);
    expect(parsed.entries.get("landing.hero.lead")).toBe(resolveLandingCopyValue("landing.hero.lead"));
    expect(parsed.entries.get("landing.instructor.storyOrigin1")).toBe(
      resolveLandingCopyValue("landing.instructor.storyOrigin1"),
    );
  });

  test("parses bracket alternate format", () => {
    const md = `<<<landing.steps.step1Title>>>
כותרת חדשה
<<<>>>`;
    const parsed = parseLandingCopyMarkdown(md);
    expect(parsed.entries.get("landing.steps.step1Title")).toBe("כותרת חדשה");
  });
});
