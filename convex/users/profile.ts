import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getOrCreateAppProfile } from "../lib/authz";
import { prepareMemberProfileFields } from "../lib/onboardingValidation";
import {
  equipmentListValidator,
  experienceValidator,
  goalsValidator,
  pathologiesListValidator,
} from "../lib/validators";

/** Update editable member fields without re-prompting for one-time health consents. */
export const updateMember = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    equipment: equipmentListValidator,
    experience: experienceValidator,
    goals: goalsValidator,
    pathologies: pathologiesListValidator,
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("נדרשת התחברות.");

    const existingRows = await ctx.db
      .query("memberProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .take(1);
    const existing = existingRows[0] ?? null;
    if (existing === null) {
      throw new Error("פרופיל לא נמצא. השלימי את ההתאמה האישית תחילה.");
    }

    const prepared = prepareMemberProfileFields(args);
    const appProfile = await getOrCreateAppProfile(ctx, userId);
    const now = Date.now();

    await ctx.db.patch(appProfile._id, {
      displayName: prepared.displayName,
      updatedAt: now,
    });

    await ctx.db.patch(existing._id, {
      equipment: prepared.equipment,
      experience: prepared.experience,
      goals: prepared.goals,
      pathologies: prepared.pathologies,
      notes: prepared.notes,
      updatedAt: now,
    });

    return existing._id;
  },
});
