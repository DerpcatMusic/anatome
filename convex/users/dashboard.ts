import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { getCreditAccess } from "../credits/lib";
import { dashboardGetReturns } from "../contracts/dashboard";
import { LIMITS } from "../lib/constants";
import { requireQueryNow } from "../lib/queryNow";
import { v } from "convex/values";

export const get = query({
  args: {
    now: v.number(),
  },
  returns: dashboardGetReturns,
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    const user = await ctx.db.get(userId);
    const appProfiles = await ctx.db
      .query("appProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .take(1);
    const appProfile = appProfiles[0] ?? null;
    const profiles = await ctx.db
      .query("memberProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .take(1);
    const memberProfile = profiles[0] ?? null;
    const at = requireQueryNow(args.now);
    const { subscription, wallet } = await getCreditAccess(ctx, userId, at);
    const subscriptionPlan = subscription ? await ctx.db.get(subscription.planId) : null;
    const pendingSubscriptionPlan = subscription?.pendingPlanId
      ? await ctx.db.get(subscription.pendingPlanId)
      : null;
    const reservations = await ctx.db
      .query("liveReservations")
      .withIndex("by_userId_and_reservedAt", (q) => q.eq("userId", userId))
      .order("desc")
      .take(LIMITS.DASHBOARD_RESERVATIONS);

    let liveAlert: {
      liveClassId: Id<"liveClasses">;
      title: string;
      startsAt: number;
    } | null = null;

    const activeReservations = reservations.filter(
      (row) => row.status === "reserved" || row.status === "joined",
    );
    if (activeReservations.length > 0) {
      const liveClasses = await ctx.db
        .query("liveClasses")
        .withIndex("by_status_and_startsAt", (q) => q.eq("status", "live"))
        .take(LIMITS.DASHBOARD_LIVE_CLASSES);
      const liveClassMap = new Map(liveClasses.map((c) => [c._id, c]));

      for (const reservation of activeReservations) {
        const liveClass = liveClassMap.get(reservation.liveClassId);
        if (liveClass !== undefined) {
          liveAlert = {
            liveClassId: liveClass._id,
            title: liveClass.title,
            startsAt: liveClass.startsAt,
          };
          break;
        }
      }
    }

    const role = appProfile?.role ?? "customer";

    return {
      user: {
        name: user?.name ?? null,
      },
      profile:
        memberProfile === null
          ? null
          : {
              experience: memberProfile.experience,
              equipment: memberProfile.equipment,
              goals: memberProfile.goals,
              pathologies: memberProfile.pathologies,
              notes: memberProfile.notes,
              healthDeclarationAnswers: memberProfile.healthDeclarationAnswers,
              healthDeclarationAcceptedAt: memberProfile.healthDeclarationAcceptedAt,
              healthInfoConsentAcceptedAt: memberProfile.healthInfoConsentAcceptedAt,
            },
      role,
      appProfile: appProfile
        ? {
            displayName: appProfile.displayName,
            credentials: appProfile.credentials,
            hasCertificate: Boolean(appProfile.certificateDocument),
            hasInsurance: Boolean(appProfile.insuranceDocument),
          }
        : null,
      needsOnboarding: memberProfile === null && role === "customer",
      liveAlert,
      subscription: subscription
        ? {
            status: subscription.status,
            currentPeriodEnd: subscription.currentPeriodEnd,
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          }
        : null,
      subscriptionPlan: subscriptionPlan
        ? {
            slug: subscriptionPlan.slug,
            nameHe: subscriptionPlan.nameHe,
            monthlyPriceIls: subscriptionPlan.monthlyPriceIls,
          }
        : null,
      pendingSubscriptionPlan: pendingSubscriptionPlan
        ? {
            slug: pendingSubscriptionPlan.slug,
            nameHe: pendingSubscriptionPlan.nameHe,
            monthlyPriceIls: pendingSubscriptionPlan.monthlyPriceIls,
          }
        : null,
      wallet: wallet
        ? {
            vodBalance: wallet.vodBalance,
            liveBalance: wallet.liveBalance,
            oneOnOneBalance: wallet.oneOnOneBalance,
          }
        : null,
    };
  },
});
