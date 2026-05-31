import { getAuthUserId } from "@convex-dev/auth/server";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type Ctx = QueryCtx | MutationCtx;
type Role = Doc<"appProfiles">["role"];

export async function requireUserId(ctx: Ctx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new Error("Authentication required");
  }
  return userId;
}

export function profileFromUser(user: Doc<"users"> | null, userId: Id<"users">, now: number) {
  const email = typeof user?.email === "string" ? user.email.toLowerCase() : "";
  const displayName =
    typeof user?.name === "string" && user.name.trim() !== "" ? user.name.trim() : email;

  return {
    userId,
    email,
    displayName,
    role: "customer" as const,
    updatedAt: now,
  };
}

export async function getOrCreateAppProfile(ctx: MutationCtx, userId: Id<"users">) {
  const existingRows = await ctx.db
    .query("appProfiles")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .take(2);
  const existing = existingRows[0] ?? null;

  if (existing !== null) {
    if (existingRows.length > 1) {
      throw new Error("Duplicate app profiles require repair");
    }
    return existing;
  }

  const user = await ctx.db.get(userId);
  const profileId = await ctx.db.insert("appProfiles", profileFromUser(user, userId, Date.now()));

  // Defensive: if a duplicate was created concurrently, delete ours and return the other.
  const afterInsert = await ctx.db
    .query("appProfiles")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .take(2);

  if (afterInsert.length > 1) {
    const ours = afterInsert.find((p) => p._id === profileId);
    if (ours) {
      await ctx.db.delete(ours._id);
    }
    const other = afterInsert.find((p) => p._id !== profileId);
    if (!other) throw new Error("Profile race condition handling failed");
    return other;
  }

  const profile = await ctx.db.get(profileId);
  if (profile === null) {
    throw new Error("Profile creation failed");
  }
  return profile;
}

export async function requireAppProfile(ctx: Ctx, userId: Id<"users">) {
  const profile = await getAppProfile(ctx, userId);

  if (profile === null) {
    throw new Error("App profile required");
  }

  return profile;
}

export async function getAppProfile(ctx: Ctx, userId: Id<"users">) {
  const profiles = await ctx.db
    .query("appProfiles")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .take(2);
  const profile = profiles[0] ?? null;

  if (profiles.length > 1) {
    throw new Error("Duplicate app profiles require repair");
  }

  return profile;
}

export function requireRole(profile: Doc<"appProfiles">, roles: Role[]) {
  if (!roles.includes(profile.role)) {
    throw new Error("Unauthorized");
  }
}

export function requireCustomer(profile: Doc<"appProfiles">) {
  requireRole(profile, ["customer"]);
}

export function requireInstructorOrAdmin(profile: Doc<"appProfiles">) {
  requireRole(profile, ["instructor", "admin"]);
}

export function isStaff(profile: Doc<"appProfiles"> | null): boolean {
  return profile !== null && (profile.role === "instructor" || profile.role === "admin");
}
