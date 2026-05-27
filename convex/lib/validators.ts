import { v } from "convex/values";
import { EQUIPMENT_STORAGE_IDS } from "./equipmentCatalog";
import { PATHOLOGY_IDS } from "./pathologyCatalog";

export const equipmentValidator = v.union(
  ...EQUIPMENT_STORAGE_IDS.map((id) => v.literal(id)),
);

export const equipmentListValidator = v.array(equipmentValidator);

export const goalValidator = v.union(
  v.literal("pelvic_floor_rehab"),
  v.literal("stress_breathing"),
  v.literal("functional_daily"),
  v.literal("back_pathology"),
  // Legacy goals — kept for existing memberProfiles
  v.literal("strength"),
  v.literal("mobility"),
  v.literal("posture"),
  v.literal("back_care"),
  v.literal("return_to_movement"),
);

export const goalsValidator = v.array(goalValidator);

export const experienceValidator = v.union(v.literal("new"), v.literal("some"), v.literal("steady"));

export const pathologyValidator = v.union(
  ...PATHOLOGY_IDS.map((id) => v.literal(id)),
);

export const pathologiesListValidator = v.array(pathologyValidator);

export const healthDeclarationAnswerValidator = v.union(v.literal("yes"), v.literal("no"));

export const healthDeclarationAnswersValidator = v.object({
  heartCondition: healthDeclarationAnswerValidator,
  chestPain: healthDeclarationAnswerValidator,
  dizziness: healthDeclarationAnswerValidator,
  boneJointIssue: healthDeclarationAnswerValidator,
  highBloodPressure: healthDeclarationAnswerValidator,
  pregnancy: healthDeclarationAnswerValidator,
  recentBirth: healthDeclarationAnswerValidator,
  recentSurgery: healthDeclarationAnswerValidator,
});
