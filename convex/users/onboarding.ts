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
import { RULES } from "../lib/constants";
import { buildDisplayName, normalizeNamePart } from "../lib/displayName";

function hasSensitiveHealthData(args: {
  pathologies: string[];
  notes: string;
  healthDeclarationAnswers: {
    heartCondition: "yes" | "no";
    chestPain: "yes" | "no";
    dizziness: "yes" | "no";
    boneJointIssue: "yes" | "no";
    highBloodPressure: "yes" | "no";
    pregnancy: "yes" | "no";
    recentBirth: "yes" | "no";
    recentSurgery: "yes" | "no";
  };
}): boolean {
  if (args.pathologies.length > 0) return true;
  if (args.notes.trim().length > 0) return true;
  return Object.values(args.healthDeclarationAnswers).some((answer) => answer === "yes");
}

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
    if (userId === null) throw new Error("Authentication required");

    const appProfile = await getOrCreateAppProfile(ctx, userId);

    const firstName = normalizeNamePart(args.firstName, "First name");
    const lastName = normalizeNamePart(args.lastName, "Last name");
    const displayName = buildDisplayName(firstName, lastName);

    const now = Date.now();
    const existingRows = await ctx.db
      .query("memberProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .take(1);
    const existing = existingRows[0] ?? null;

    const cleanNotes = args.notes.trim().slice(0, RULES.MAX_ONBOARDING_NOTES_LENGTH);
    const cleanPathologies = [...new Set(args.pathologies)];

    if (!args.healthDeclarationAccepted) {
      throw new Error("Health declaration is required before starting.");
    }

    const sensitiveData = hasSensitiveHealthData({
      pathologies: cleanPathologies,
      notes: cleanNotes,
      healthDeclarationAnswers: args.healthDeclarationAnswers,
    });

    if (sensitiveData && !args.healthInfoConsent) {
      throw new Error("Health information consent is required before saving health data.");
    }

    const profilePatch = {
      equipment: args.equipment,
      experience: args.experience,
      goals: args.goals,
      pathologies: cleanPathologies,
      notes: cleanNotes,
      healthDeclarationAnswers: args.healthDeclarationAnswers,
      healthDeclarationAcceptedAt: now,
      healthInfoConsentAcceptedAt: sensitiveData
        ? now
        : existing?.healthInfoConsentAcceptedAt,
      updatedAt: now,
    };

    await ctx.db.patch(appProfile._id, {
      displayName,
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
