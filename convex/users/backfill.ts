import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import { internal } from "../_generated/api";
import { internalMutation } from "../_generated/server";
import { profileFromUser } from "../lib/authz";
import { LIMITS } from "../lib/constants";
import {
  buildMemberProfilePatch,
  memberProfileNeedsUpdate,
  normalizeDisplayName,
  normalizeStoredMemberProfile,
} from "../lib/normalizeStoredProfile";

const DEFAULT_BATCH = LIMITS.PAGE_SIZE;

type BackfillPhase = "memberProfiles" | "users";

export const backfillProfilesFromCatalogs = internalMutation({
  args: {
    dryRun: v.optional(v.boolean()),
    cursor: v.optional(v.union(v.string(), v.null())),
    batchSize: v.optional(v.number()),
    phase: v.optional(v.union(v.literal("memberProfiles"), v.literal("users"))),
  },
  returns: v.object({
    phase: v.union(v.literal("memberProfiles"), v.literal("users")),
    dryRun: v.boolean(),
    processed: v.number(),
    memberProfilesUpdated: v.number(),
    memberProfilesSkipped: v.number(),
    appProfilesDisplayNameUpdated: v.number(),
    appProfilesCreated: v.number(),
    errors: v.array(v.string()),
    isDone: v.boolean(),
    continueCursor: v.union(v.string(), v.null()),
  }),
  handler: async (ctx, args) => {
    const dryRun = args.dryRun ?? false;
    const phase: BackfillPhase = args.phase ?? "memberProfiles";
    const batchSize = Math.min(
      Math.max(1, Math.floor(args.batchSize ?? DEFAULT_BATCH)),
      LIMITS.CATALOG_PAGE_SIZE,
    );
    const now = Date.now();

    let processed = 0;
    let memberProfilesUpdated = 0;
    let memberProfilesSkipped = 0;
    let appProfilesDisplayNameUpdated = 0;
    let appProfilesCreated = 0;
    const errors: string[] = [];

    const patchAppDisplayName = async (userId: Id<"users">) => {
      const rows = await ctx.db
        .query("appProfiles")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .take(1);
      const appProfile = rows[0] ?? null;
      if (appProfile === null) return;

      const displayName = normalizeDisplayName(appProfile.displayName);
      if (displayName === appProfile.displayName) return;
      if (dryRun) {
        appProfilesDisplayNameUpdated += 1;
        return;
      }
      await ctx.db.patch(appProfile._id, { displayName, updatedAt: now });
      appProfilesDisplayNameUpdated += 1;
    };

    if (phase === "memberProfiles") {
      const page = await ctx.db.query("memberProfiles").paginate({
        numItems: batchSize,
        cursor: args.cursor ?? null,
      });

      for (const profile of page.page) {
        processed += 1;
        try {
          const normalized = normalizeStoredMemberProfile(profile);
          const needsMemberUpdate = memberProfileNeedsUpdate(profile, normalized);

          if (needsMemberUpdate) {
            if (dryRun) {
              memberProfilesUpdated += 1;
            } else {
              await ctx.db.patch(
                profile._id,
                buildMemberProfilePatch(profile, normalized, now),
              );
              memberProfilesUpdated += 1;
            }
          } else {
            memberProfilesSkipped += 1;
          }

          await patchAppDisplayName(profile.userId);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          errors.push(`memberProfile ${profile._id}: ${message}`);
        }
      }

      if (!page.isDone) {
        return {
          phase: "memberProfiles" as const,
          dryRun,
          processed,
          memberProfilesUpdated,
          memberProfilesSkipped,
          appProfilesDisplayNameUpdated,
          appProfilesCreated,
          errors,
          isDone: false,
          continueCursor: page.continueCursor,
        };
      }

      if (!dryRun) {
        await ctx.scheduler.runAfter(0, internal.users.backfill.backfillProfilesFromCatalogs, {
          dryRun: false,
          cursor: null,
          phase: "users",
        });
      }

      return {
        phase: "memberProfiles" as const,
        dryRun,
        processed,
        memberProfilesUpdated,
        memberProfilesSkipped,
        appProfilesDisplayNameUpdated,
        appProfilesCreated,
        errors,
        isDone: dryRun,
        continueCursor: null,
      };
    }

    const userPage = await ctx.db.query("users").paginate({
      numItems: batchSize,
      cursor: args.cursor ?? null,
    });

    for (const user of userPage.page) {
      processed += 1;
      try {
        const existingRows = await ctx.db
          .query("appProfiles")
          .withIndex("by_userId", (q) => q.eq("userId", user._id))
          .take(1);
        const existing = existingRows[0] ?? null;

        if (existing === null) {
          if (dryRun) {
            appProfilesCreated += 1;
          } else {
            await ctx.db.insert("appProfiles", profileFromUser(user, user._id, now));
            appProfilesCreated += 1;
          }
        }

        await patchAppDisplayName(user._id);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        errors.push(`user ${user._id}: ${message}`);
      }
    }

    if (!userPage.isDone && !dryRun) {
      await ctx.scheduler.runAfter(0, internal.users.backfill.backfillProfilesFromCatalogs, {
        dryRun: false,
        cursor: userPage.continueCursor,
        phase: "users",
      });
    }

    return {
      phase: "users" as const,
      dryRun,
      processed,
      memberProfilesUpdated,
      memberProfilesSkipped,
      appProfilesDisplayNameUpdated,
      appProfilesCreated,
      errors,
      isDone: userPage.isDone,
      continueCursor: userPage.isDone ? null : userPage.continueCursor,
    };
  },
});
