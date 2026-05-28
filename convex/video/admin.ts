import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { paginationOptsValidator } from "convex/server";
import {
  adminVideoListReturns,
  adminVideoPaginatedReturns,
} from "../contracts/video";
import { requireUserId, requireAppProfile, requireRole } from "../lib/authz";
import { toAdminVideoRow } from "../lib/adminVideoRow";
import { normalizeEquipmentList } from "../lib/equipmentCatalog";
import { equipmentListValidator } from "../lib/validators";
import { LIMITS } from "../lib/constants";

const accessKindValidator = v.union(v.literal("macroflow"), v.literal("microflow"));

export const listAll = query({
  args: {},
  returns: adminVideoListReturns,
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const profile = await requireAppProfile(ctx, userId);
    requireRole(profile, ["instructor", "admin"]);
    const published = await ctx.db
      .query("videos")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .order("desc")
      .take(LIMITS.ADMIN_VIDEO_PAGE);
    const drafts = await ctx.db
      .query("videos")
      .withIndex("by_status", (q) => q.eq("status", "draft"))
      .order("desc")
      .take(LIMITS.ADMIN_VIDEO_PAGE);
    const archived = await ctx.db
      .query("videos")
      .withIndex("by_status", (q) => q.eq("status", "archived"))
      .order("desc")
      .take(LIMITS.ADMIN_VIDEO_PAGE);
    return {
      published: published.map(toAdminVideoRow),
      drafts: drafts.map(toAdminVideoRow),
      archived: archived.map(toAdminVideoRow),
    };
  },
});

export const listByStatusPaginated = query({
  args: {
    status: v.union(v.literal("published"), v.literal("draft"), v.literal("archived")),
    paginationOpts: paginationOptsValidator,
  },
  returns: adminVideoPaginatedReturns,
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const profile = await requireAppProfile(ctx, userId);
    requireRole(profile, ["instructor", "admin"]);
    const page = await ctx.db
      .query("videos")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .order("desc")
      .paginate(args.paginationOpts);
    return {
      page: page.page.map(toAdminVideoRow),
      isDone: page.isDone,
      continueCursor: page.continueCursor,
    };
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
  returns: v.id("videos"),
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
