import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { paginationOptsValidator } from "convex/server";
import { requireUserId, requireAppProfile, requireRole } from "../lib/authz";
import { normalizeEquipmentList } from "../lib/equipmentCatalog";
import { equipmentListValidator } from "../lib/validators";
import { LIMITS } from "../lib/constants";

const accessKindValidator = v.union(v.literal("macroflow"), v.literal("microflow"));

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const profile = await requireAppProfile(ctx, userId);
    requireRole(profile, ["instructor", "admin"]);
    return {
      published: await ctx.db.query("videos").withIndex("by_status", (q) => q.eq("status", "published")).order("desc").take(LIMITS.ADMIN_VIDEO_PAGE),
      drafts: await ctx.db.query("videos").withIndex("by_status", (q) => q.eq("status", "draft")).order("desc").take(LIMITS.ADMIN_VIDEO_PAGE),
      archived: await ctx.db.query("videos").withIndex("by_status", (q) => q.eq("status", "archived")).order("desc").take(LIMITS.ADMIN_VIDEO_PAGE),
    };
  },
});

export const listByStatusPaginated = query({
  args: {
    status: v.union(v.literal("published"), v.literal("draft"), v.literal("archived")),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const profile = await requireAppProfile(ctx, userId);
    requireRole(profile, ["instructor", "admin"]);
    return await ctx.db
      .query("videos")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const updateMetadata = mutation({
  args: {
    videoId: v.id("videos"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    requiredEquipment: v.optional(equipmentListValidator),
    accessKind: v.optional(accessKindValidator),
    status: v.optional(v.union(v.literal("draft"), v.literal("published"), v.literal("archived"))),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const profile = await requireAppProfile(ctx, userId);
    requireRole(profile, ["instructor", "admin"]);
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.title !== undefined) patch.title = args.title.trim();
    if (args.description !== undefined) patch.description = args.description.trim();
    if (args.requiredEquipment !== undefined) {
      patch.requiredEquipment = normalizeEquipmentList(args.requiredEquipment);
    }
    if (args.accessKind !== undefined) patch.accessKind = args.accessKind;
    if (args.status !== undefined) patch.status = args.status;
    await ctx.db.patch(args.videoId, patch);
    return args.videoId;
  },
});
