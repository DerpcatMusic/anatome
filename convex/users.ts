import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getOrCreateAppProfile } from "./lib/authz";
import { equipmentListValidator, experienceValidator, goalsValidator } from "./lib/validators";

export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      return null;
    }

    return await ctx.db.get(userId);
  },
});

export const dashboard = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      return null;
    }

    const user = await ctx.db.get(userId);
    const appProfile = await ctx.db
      .query("appProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    const profile = await ctx.db
      .query("memberProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    const now = Date.now();
    const reservations = await ctx.db
      .query("liveReservations")
      .withIndex("by_userId_and_status", (q) =>
        q.eq("userId", userId).eq("status", "reserved")
      )
      .order("desc")
      .take(20);

    let liveAlert: {
      liveClassId: typeof reservations[number]["liveClassId"];
      title: string;
      startsAt: number;
    } | null = null;

    if (reservations.length > 0) {
      // Batch-fetch live classes that are currently live
      const liveClasses = await ctx.db
        .query("liveClasses")
        .withIndex("by_status_and_startsAt", (q) => q.eq("status", "live"))
        .take(50);

      const liveClassMap = new Map(liveClasses.map((c) => [c._id, c]));

      for (const reservation of reservations) {
        const liveClass = liveClassMap.get(reservation.liveClassId);
        if (
          liveClass !== undefined &&
          now >= liveClass.joinOpensAt &&
          now <= liveClass.joinClosesAt
        ) {
          liveAlert = {
            liveClassId: liveClass._id,
            title: liveClass.title,
            startsAt: liveClass.startsAt,
          };
          break;
        }
      }
    }

    const role = appProfile?.role ?? "customer";
    return {
      user,
      profile,
      role,
      appProfile: appProfile
        ? {
            displayName: appProfile.displayName,
            credentials: appProfile.credentials,
            certificateDocument: appProfile.certificateDocument,
            insuranceDocument: appProfile.insuranceDocument,
          }
        : null,
      needsOnboarding: profile === null && role === "customer",
      liveAlert,
    };
  },
});

export const completeOnboarding = mutation({
  args: {
    equipment: equipmentListValidator,
    experience: experienceValidator,
    goals: goalsValidator,
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      throw new Error("Authentication required");
    }

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
