import { v } from "convex/values";

export const equipmentValidator = v.union(
  v.literal("mat"),
  v.literal("reformer"),
  v.literal("cadillac"),
  v.literal("chair"),
  v.literal("barrel"),
  v.literal("spine_corrector"),
  v.literal("magic_circle"),
  v.literal("small_ball"),
  v.literal("resistance_band"),
  v.literal("light_weights"),
  v.literal("roller"),
  v.literal("spiky_balls"),
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
  v.literal("back_pain"),
  v.literal("disc_herniation"),
  v.literal("neck_pain"),
  v.literal("sciatica"),
  v.literal("pregnancy"),
  v.literal("postpartum"),
  v.literal("osteoporosis"),
  v.literal("scoliosis"),
  v.literal("diastasis_recti"),
  v.literal("pelvic_floor_weakness"),
  v.literal("hip_pain"),
  v.literal("knee_pain"),
  v.literal("shoulder_pain"),
  v.literal("fibromyalgia"),
  v.literal("arthritis"),
  v.literal("post_surgery"),
  v.literal("incontinence"),
  v.literal("prolapse"),
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
