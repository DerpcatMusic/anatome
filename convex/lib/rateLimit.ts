import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface RateLimitConfig {
  /** Max attempts allowed */
  max: number;
  /** Window size in milliseconds */
  windowMs: number;
}

const DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
  reservation: { max: 10, windowMs: 60_000 },
  purchase: { max: 10, windowMs: 60_000 },
  oneOnOneRequest: { max: 5, windowMs: 60_000 },
  uploadRequest: { max: 5, windowMs: 60_000 },
  authCode: { max: 5, windowMs: 60_000 },
};

/**
 * Simple sliding-window rate limiter using the `rateLimits` table.
 * Each call records a timestamp; old entries outside the window are purged.
 * Throws if the user has exceeded the allowed attempts.
 */
export async function checkRateLimit(
  ctx: MutationCtx,
  userId: Id<"users">,
  action: string,
  config?: Partial<RateLimitConfig>,
) {
  const now = Date.now();
  const { max, windowMs } = { ...DEFAULT_CONFIGS[action], ...config };

  // Purge old entries for this user+action
  const old = await ctx.db
    .query("rateLimits")
    .withIndex("by_userId_and_action", (q) =>
      q.eq("userId", userId).eq("action", action),
    )
    .collect();

  for (const entry of old) {
    if (now - entry.timestamp > windowMs) {
      await ctx.db.delete(entry._id);
    }
  }

  // Count remaining entries in window
  const recent = old.filter((e) => now - e.timestamp <= windowMs);
  if (recent.length >= max) {
    throw new Error("Rate limit exceeded. Please try again later.");
  }

  // Record this attempt
  await ctx.db.insert("rateLimits", {
    userId,
    action,
    timestamp: now,
  });
}
