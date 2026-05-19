import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";

type CalendarClass = {
  liveClass: Doc<"liveClasses">;
  seatsTaken: number;
  seatsRemaining: number;
  viewerReservationStatus: Doc<"liveReservations">["status"] | null;
  viewerCanReserve: boolean;
  viewerCanJoin: boolean;
  viewerAvailableCredits: number;
  viewerMissingEquipment: string[];
  viewerRole: Doc<"appProfiles">["role"] | null;
};

export const listCalendarRange = query({
  args: {
    from: v.number(),
    to: v.number(),
  },
  handler: async (ctx, args): Promise<CalendarClass[]> => {
    const result: CalendarClass[] = await ctx.runQuery(api.liveClasses.listCalendarRange, args);
    return result;
  },
});

export const listMyReservations = query({
  args: {},
  handler: async (ctx): Promise<Doc<"liveReservations">[]> => {
    const reservations: Doc<"liveReservations">[] = await ctx.runQuery(api.liveClasses.listMyReservations, {});
    return reservations;
  },
});

export const reserve = mutation({
  args: {
    liveClassId: v.id("liveClasses"),
  },
  handler: async (ctx, args): Promise<Id<"liveReservations">> => {
    return await ctx.runMutation(api.liveClasses.reserve, args);
  },
});

export const cancelReservation = mutation({
  args: {
    liveClassId: v.id("liveClasses"),
  },
  handler: async (ctx, args): Promise<Id<"liveReservations">> => {
    return await ctx.runMutation(api.liveClasses.cancelReservation, args);
  },
});
