import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getOrCreateAppProfile } from "../lib/authz";
import {
  equipmentListValidator,
  experienceValidator,
  goalsValidator,
  healthDeclarationAnswersValidator,
  pathologiesListValidator,
} from "../lib/validators";
import { prepareOnboardingProfile } from "../lib/onboardingValidation";

export const complete = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    equipment: equipmentListValidator,
    experience: experienceValidator,
    goals: goalsValidator,
    pathologies: pathologiesListValidator,
    notes: v.string(),
    healthDeclarationAnswers: healthDeclarationAnswersValidator,
    healthInfoConsent: v.boolean(),
    healthDeclarationAccepted: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("נדרשת התחברות.");

    const prepared = prepareOnboardingProfile(args);
    const appProfile = await getOrCreateAppProfile(ctx, userId);

    const now = Date.now();
    const existingRows = await ctx.db
      .query("memberProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .take(1);
    const existing = existingRows[0] ?? null;

    const profilePatch = {
      equipment: prepared.equipment,
      experience: prepared.experience,
      goals: prepared.goals,
      pathologies: prepared.pathologies,
      notes: prepared.notes,
      healthDeclarationAnswers: prepared.healthDeclarationAnswers,
      healthDeclarationAcceptedAt: now,
      healthInfoConsentAcceptedAt: now,
      updatedAt: now,
    };

    await ctx.db.patch(appProfile._id, {
      displayName: prepared.displayName,
      updatedAt: now,
    });

    if (existing !== null) {
      await ctx.db.patch(existing._id, profilePatch);
      return existing._id;
    }

    return await ctx.db.insert("memberProfiles", {
      userId,
      ...profilePatch,
      onboardingCompletedAt: now,
    });
  },
});
