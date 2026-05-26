import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { getOrCreateAppProfile } from "./authz";

export type PromoteInstructorOptions = {
  /** Remove member onboarding row so the account is instructor-only (default true). */
  clearMemberProfile?: boolean;
};

/**
 * Promote a user to instructor: sync app profile, clear disable flag, optionally drop member profile.
 */
export async function promoteUserToInstructor(
  ctx: MutationCtx,
  userId: Id<"users">,
  options: PromoteInstructorOptions = {},
) {
  const clearMemberProfile = options.clearMemberProfile ?? true;

  const user = await ctx.db.get(userId);
  if (user === null) throw new Error("User not found");

  const profile = await getOrCreateAppProfile(ctx, userId);
  const now = Date.now();
  const email =
    typeof user.email === "string" && user.email.trim() !== ""
      ? user.email.trim().toLowerCase()
      : profile.email;
  const displayName =
    typeof user.name === "string" && user.name.trim() !== ""
      ? user.name.trim()
      : profile.displayName || email;

  await ctx.db.patch(profile._id, {
    role: "instructor",
    email,
    displayName,
    instructorEnabledAt: profile.instructorEnabledAt ?? now,
    instructorDisabledAt: undefined,
    updatedAt: now,
  });

  if (clearMemberProfile) {
    const memberRows = await ctx.db
      .query("memberProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    for (const row of memberRows) {
      await ctx.db.delete(row._id);
    }
  }

  return profile._id;
}
