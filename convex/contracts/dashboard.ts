import { v } from "convex/values";
import {
  equipmentListValidator,
  experienceValidator,
  goalsValidator,
  healthDeclarationAnswersValidator,
  pathologiesListValidator,
} from "../lib/validators";
import { profileRoleValidator } from "../lib/domainValidators";

export const dashboardRoleValidator = profileRoleValidator;

export const dashboardUserValidator = v.object({
  name: v.union(v.string(), v.null()),
});

export const dashboardMemberProfileValidator = v.union(
  v.null(),
  v.object({
    experience: experienceValidator,
    equipment: equipmentListValidator,
    goals: goalsValidator,
    pathologies: v.optional(pathologiesListValidator),
    notes: v.string(),
    healthDeclarationAnswers: v.optional(healthDeclarationAnswersValidator),
    healthDeclarationAcceptedAt: v.optional(v.number()),
    healthInfoConsentAcceptedAt: v.optional(v.number()),
  }),
);

export const dashboardStaffAppProfileValidator = v.union(
  v.null(),
  v.object({
    displayName: v.string(),
    credentials: v.optional(v.string()),
    hasCertificate: v.boolean(),
    hasInsurance: v.boolean(),
  }),
);

export const dashboardLiveAlertValidator = v.union(
  v.null(),
  v.object({
    liveClassId: v.id("liveClasses"),
    title: v.string(),
    startsAt: v.number(),
  }),
);

export const dashboardPlanValidator = v.object({
  slug: v.string(),
  nameHe: v.string(),
  monthlyPriceIls: v.number(),
});

export const dashboardSubscriptionValidator = v.object({
  status: v.union(
    v.literal("trialing"),
    v.literal("active"),
    v.literal("past_due"),
    v.literal("cancelled"),
    v.literal("expired"),
  ),
  currentPeriodEnd: v.number(),
  cancelAtPeriodEnd: v.boolean(),
});

export const dashboardWalletValidator = v.object({
  vodBalance: v.number(),
  liveBalance: v.number(),
  oneOnOneBalance: v.number(),
});

export const dashboardGetReturns = v.union(
  v.null(),
  v.object({
    user: dashboardUserValidator,
    profile: dashboardMemberProfileValidator,
    role: dashboardRoleValidator,
    appProfile: dashboardStaffAppProfileValidator,
    needsOnboarding: v.boolean(),
    liveAlert: dashboardLiveAlertValidator,
    subscription: v.union(v.null(), dashboardSubscriptionValidator),
    subscriptionPlan: v.union(v.null(), dashboardPlanValidator),
    pendingSubscriptionPlan: v.union(v.null(), dashboardPlanValidator),
    wallet: v.union(v.null(), dashboardWalletValidator),
  }),
);
