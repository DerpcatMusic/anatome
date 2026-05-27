import { v } from "convex/values";
import { EQUIPMENT_STORAGE_IDS } from "./equipmentCatalog";
import { EXPERIENCE_IDS } from "./experienceCatalog";
import { GOAL_IDS } from "./goalCatalog";
import { PATHOLOGY_IDS } from "./pathologyCatalog";

export const equipmentValidator = v.union(
  ...EQUIPMENT_STORAGE_IDS.map((id) => v.literal(id)),
);

export const equipmentListValidator = v.array(equipmentValidator);

export const goalValidator = v.union(...GOAL_IDS.map((id) => v.literal(id)));

export const goalsValidator = v.array(goalValidator);

export const experienceValidator = v.union(
  ...EXPERIENCE_IDS.map((id) => v.literal(id)),
);

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
