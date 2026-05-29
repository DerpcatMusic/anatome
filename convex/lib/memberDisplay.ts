import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

export type MemberPublicProfile = {
  displayName: string;
  avatarUrl: string | null;
};

const FALLBACK_MEMBER_NAME = "משתתפת";

/** True when the string is only an email address (not a human name). */
export function isEmailLike(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed.includes("@")) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

/** Prefer app profile name; never surface raw email as the instructor-facing label. */
export function preferredMemberDisplayName(
  appProfile: Pick<Doc<"appProfiles">, "displayName"> | null,
  user: Pick<Doc<"users">, "name"> | null,
): string {
  const fromProfile = appProfile?.displayName.trim() ?? "";
  if (fromProfile.length > 0 && !isEmailLike(fromProfile)) {
    return fromProfile;
  }

  const fromUserName = typeof user?.name === "string" ? user.name.trim() : "";
  if (fromUserName.length > 0 && !isEmailLike(fromUserName)) {
    return fromUserName;
  }

  return FALLBACK_MEMBER_NAME;
}

export async function memberPublicProfileForUser(
  ctx: QueryCtx,
  userId: Id<"users">,
): Promise<MemberPublicProfile> {
  const profiles = await ctx.db
    .query("appProfiles")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .take(1);
  const profile = profiles[0] ?? null;
  const user = await ctx.db.get(userId);

  const avatarUrl =
    profile?.avatarStorageId !== undefined
      ? await ctx.storage.getUrl(profile.avatarStorageId)
      : null;

  return {
    displayName: preferredMemberDisplayName(profile, user),
    avatarUrl,
  };
}

export async function loadMemberPublicProfiles(
  ctx: QueryCtx,
  userIds: Iterable<Id<"users">>,
): Promise<Map<string, MemberPublicProfile>> {
  const map = new Map<string, MemberPublicProfile>();
  const seen = new Set<string>();

  for (const userId of userIds) {
    const key = userId as string;
    if (seen.has(key)) continue;
    seen.add(key);
    map.set(key, await memberPublicProfileForUser(ctx, userId));
  }

  return map;
}

/** @deprecated Use {@link memberPublicProfileForUser} */
export async function displayNameForUser(
  ctx: QueryCtx,
  userId: Id<"users">,
): Promise<string> {
  const profile = await memberPublicProfileForUser(ctx, userId);
  return profile.displayName;
}
