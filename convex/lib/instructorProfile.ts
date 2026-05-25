import type { Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

export type InstructorPublicProfile = {
  userId: Id<"users">;
  displayName: string;
  avatarUrl: string | null;
};

export async function loadInstructorProfiles(
  ctx: QueryCtx,
  instructorUserIds: Iterable<Id<"users">>,
): Promise<Map<string, InstructorPublicProfile>> {
  const map = new Map<string, InstructorPublicProfile>();
  const seen = new Set<string>();

  for (const instructorUserId of instructorUserIds) {
    const key = instructorUserId as string;
    if (seen.has(key)) continue;
    seen.add(key);

    const profiles = await ctx.db
      .query("appProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", instructorUserId))
      .take(1);
    const profile = profiles[0];
    const avatarUrl =
      profile?.avatarStorageId !== undefined
        ? await ctx.storage.getUrl(profile.avatarStorageId)
        : null;

    map.set(key, {
      userId: instructorUserId,
      displayName: profile?.displayName ?? "המדריכה",
      avatarUrl,
    });
  }

  return map;
}
