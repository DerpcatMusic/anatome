import { describe, expect, test } from "bun:test";
import { normalizeEquipmentId, normalizeEquipmentList } from "./equipmentCatalog";
import { normalizePathologyList } from "./pathologyCatalog";
import { hasSensitiveHealthData, prepareOnboardingProfile } from "./onboardingValidation";

const completeHealthAnswers = {
  heartCondition: "no" as const,
  chestPain: "no" as const,
  dizziness: "no" as const,
  boneJointIssue: "no" as const,
  highBloodPressure: "no" as const,
  pregnancy: "no" as const,
  recentBirth: "no" as const,
  recentSurgery: "no" as const,
};

const baseArgs = {
  firstName: "מיה",
  lastName: "כהן",
  equipment: ["mat", "barrel"],
  experience: "some" as const,
  goals: ["pelvic_floor_rehab"] as ["pelvic_floor_rehab"],
  pathologies: ["back_pain", "sciatica"],
  notes: "",
  healthDeclarationAnswers: completeHealthAnswers,
  healthInfoConsent: true,
  healthDeclarationAccepted: true,
};

describe("equipmentCatalog", () => {
  test("normalizes legacy barrel to spine_corrector", () => {
    expect(normalizeEquipmentId("barrel")).toBe("spine_corrector");
    expect(normalizeEquipmentList(["mat", "barrel", "spine_corrector"])).toEqual([
      "mat",
      "spine_corrector",
    ]);
  });
});

describe("prepareOnboardingProfile", () => {
  test("persists pathologies and normalizes equipment", () => {
    const prepared = prepareOnboardingProfile(baseArgs);
    expect(prepared.pathologies).toEqual(["back_pain", "sciatica"]);
    expect(prepared.equipment).toEqual(["mat", "spine_corrector"]);
  });

  test("requires health consent when sensitive data present", () => {
    expect(() =>
      prepareOnboardingProfile({
        ...baseArgs,
        healthInfoConsent: false,
      }),
    ).toThrow(/הסכמה/);
  });

  test("requires at least one equipment item", () => {
    expect(() =>
      prepareOnboardingProfile({
        ...baseArgs,
        equipment: ["barrel"],
        pathologies: [],
      }),
    ).not.toThrow();
    expect(() =>
      prepareOnboardingProfile({
        ...baseArgs,
        equipment: [],
      }),
    ).toThrow(/ציוד/);
  });
});

describe("pathologyCatalog", () => {
  test("deduplicates pathology ids", () => {
    expect(normalizePathologyList(["back_pain", "back_pain", "invalid"])).toEqual([
      "back_pain",
    ]);
  });
});

describe("hasSensitiveHealthData", () => {
  test("detects pathologies and notes", () => {
    expect(
      hasSensitiveHealthData({
        pathologies: ["back_pain"],
        notes: "",
        healthDeclarationAnswers: completeHealthAnswers,
      }),
    ).toBe(true);
    expect(
      hasSensitiveHealthData({
        pathologies: [],
        notes: "  ",
        healthDeclarationAnswers: completeHealthAnswers,
      }),
    ).toBe(false);
  });
});
