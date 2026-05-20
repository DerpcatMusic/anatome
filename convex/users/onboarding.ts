import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getOrCreateAppProfile } from "../lib/authz";
import { equipmentListValidator, experienceValidator, goalsValidator } from "../lib/validators";

export const complete = mutation({
  args: {
    equipment: equipmentListValidator,
    experience: experienceValidator,
    goals: goalsValidator,
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Authentication required");

    await getOrCreateAppProfile(ctx, userId);

    const now = Date.now();
    const existing = await ctx.db
      .query("memberProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    const cleanNotes = args.notes.trim().slice(0, 600);

    if (existing !== null) {
      await ctx.db.patch(existing._id, {
        equipment: args.equipment,
        experience: args.experience,
        goals: args.goals,
        notes: cleanNotes,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("memberProfiles", {
      userId,
      equipment: args.equipment,
      experience: args.experience,
      goals: args.goals,
      notes: cleanNotes,
      onboardingCompletedAt: now,
      updatedAt: now,
    });
  },
});
