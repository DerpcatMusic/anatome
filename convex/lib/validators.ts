import { v } from "convex/values";

export const equipmentValidator = v.union(
  v.literal("mat"),
  v.literal("reformer"),
  v.literal("cadillac"),
  v.literal("chair"),
  v.literal("barrel"),
  v.literal("magic_circle"),
  v.literal("small_ball"),
  v.literal("resistance_band"),
  v.literal("light_weights"),
);

export const equipmentListValidator = v.array(equipmentValidator);

export const goalsValidator = v.array(
  v.union(
    v.literal("strength"),
    v.literal("mobility"),
    v.literal("posture"),
    v.literal("back_care"),
    v.literal("return_to_movement"),
  ),
);

export const experienceValidator = v.union(v.literal("new"), v.literal("some"), v.literal("steady"));
