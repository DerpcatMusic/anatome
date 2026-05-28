import type { MutationCtx } from "../../_generated/server";
import type { Id } from "../../_generated/dataModel";

export async function logCardcomAudit(
  ctx: MutationCtx,
  action: string,
  metadata: Record<string, unknown>,
  targetUserId?: Id<"users">,
) {
  const admins = await ctx.db
    .query("appProfiles")
    .withIndex("by_role", (q) => q.eq("role", "admin"))
    .take(1);
  const actor = admins[0];
  if (actor === undefined) {
    console.error("[CardCom audit]", action, metadata);
    return;
  }

  await ctx.db.insert("adminAuditEvents", {
    actorUserId: actor.userId,
    targetUserId,
    action,
    metadata: JSON.stringify(metadata),
    createdAt: Date.now(),
  });
}
