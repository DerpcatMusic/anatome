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

  // Purge a bounded batch of old entries for this user+action.
  const old = await ctx.db
    .query("rateLimits")
    .withIndex("by_userId_and_action_and_timestamp", (q) =>
      q.eq("userId", userId).eq("action", action).lt("timestamp", now - windowMs),
    )
    .take(100);

  for (const entry of old) {
    await ctx.db.delete(entry._id);
  }

  const recent = await ctx.db
    .query("rateLimits")
    .withIndex("by_userId_and_action_and_timestamp", (q) =>
      q.eq("userId", userId).eq("action", action).gte("timestamp", now - windowMs),
    )
    .take(max);
  if (recent.length >= max) {
    throw new Error("נא להמתין מעט לפני הניסיון הבא");
  }

  // Record this attempt
  await ctx.db.insert("rateLimits", {
    userId,
    action,
    timestamp: now,
  });
}
