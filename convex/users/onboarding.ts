import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getOrCreateAppProfile } from "../lib/authz";
import { equipmentListValidator, experienceValidator, goalsValidator } from "../lib/validators";
import { RULES } from "../lib/constants";

export const complete = mutation({
  args: {
    equipment: equipmentListValidator,
    experience: experienceValidator,
    goals: goalsValidator,
    notes: v.string(),
    healthInfoConsent: v.boolean(),
    healthDeclarationAccepted: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Authentication required");

    await getOrCreateAppProfile(ctx, userId);

    const now = Date.now();
    const existingRows = await ctx.db
      .query("memberProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .take(1);
    const existing = existingRows[0] ?? null;

    const cleanNotes = args.notes.trim().slice(0, RULES.MAX_ONBOARDING_NOTES_LENGTH);
    if (!args.healthDeclarationAccepted) {
      throw new Error("Health declaration is required before starting.");
    }
    if (cleanNotes.length > 0 && !args.healthInfoConsent) {
      throw new Error("Health information consent is required before saving notes.");
    }

    if (existing !== null) {
      await ctx.db.patch(existing._id, {
        equipment: args.equipment,
        experience: args.experience,
        goals: args.goals,
        notes: cleanNotes,
        healthInfoConsentAcceptedAt: cleanNotes.length > 0 ? now : existing.healthInfoConsentAcceptedAt,
        healthDeclarationAcceptedAt: now,
        updatedAt: now,
      });
      return existing._id;
    }

    const payload = {
      userId,
      equipment: args.equipment,
      experience: args.experience,
      goals: args.goals,
      notes: cleanNotes,
      healthDeclarationAcceptedAt: now,
      onboardingCompletedAt: now,
      updatedAt: now,
    };

    return await ctx.db.insert(
      "memberProfiles",
      cleanNotes.length > 0
        ? { ...payload, healthInfoConsentAcceptedAt: now }
        : payload,
    );
  },
});
