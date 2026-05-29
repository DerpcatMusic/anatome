import type { Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

export async function displayNameForUser(
  ctx: QueryCtx,
  userId: Id<"users">,
): Promise<string> {
  const profiles = await ctx.db
    .query("appProfiles")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .take(1);
  const profile = profiles[0];
  if (profile !== undefined && profile.displayName.trim() !== "") {
    return profile.displayName.trim();
  }

  const user = await ctx.db.get(userId);
  if (user !== null && typeof user.name === "string" && user.name.trim() !== "") {
    return user.name.trim();
  }

  return "משתתפת";
}
