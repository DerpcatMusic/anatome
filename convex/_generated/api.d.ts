/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as credits_lib from "../credits/lib.js";
import type * as credits_migrate from "../credits/migrate.js";
import type * as crons from "../crons.js";
import type * as email_authVerification from "../email/authVerification.js";
import type * as email_liveReminder from "../email/liveReminder.js";
import type * as email_resend from "../email/resend.js";
import type * as email_resendEvents from "../email/resendEvents.js";
import type * as http from "../http.js";
import type * as lib_appTime from "../lib/appTime.js";
import type * as lib_authz from "../lib/authz.js";
import type * as lib_constants from "../lib/constants.js";
import type * as lib_displayName from "../lib/displayName.js";
import type * as lib_email from "../lib/email.js";
import type * as lib_equipment from "../lib/equipment.js";
import type * as lib_equipmentCatalog from "../lib/equipmentCatalog.js";
import type * as lib_experienceCatalog from "../lib/experienceCatalog.js";
import type * as lib_featureFlags from "../lib/featureFlags.js";
import type * as lib_goalCatalog from "../lib/goalCatalog.js";
import type * as lib_instructorProfile from "../lib/instructorProfile.js";
import type * as lib_live from "../lib/live.js";
import type * as lib_liveClassAccess from "../lib/liveClassAccess.js";
import type * as lib_liveClassDisplay from "../lib/liveClassDisplay.js";
import type * as lib_liveJoin from "../lib/liveJoin.js";
import type * as lib_liveReminderDelivery from "../lib/liveReminderDelivery.js";
import type * as lib_liveRoom from "../lib/liveRoom.js";
import type * as lib_liveSidebar from "../lib/liveSidebar.js";
import type * as lib_livekitEnv from "../lib/livekitEnv.js";
import type * as lib_normalizeStoredProfile from "../lib/normalizeStoredProfile.js";
import type * as lib_onboardingValidation from "../lib/onboardingValidation.js";
import type * as lib_oneOnOne from "../lib/oneOnOne.js";
import type * as lib_pathologyCatalog from "../lib/pathologyCatalog.js";
import type * as lib_promoteInstructor from "../lib/promoteInstructor.js";
import type * as lib_queryNow from "../lib/queryNow.js";
import type * as lib_rateLimit from "../lib/rateLimit.js";
import type * as lib_validators from "../lib/validators.js";
import type * as lifecycle_repair from "../lifecycle/repair.js";
import type * as live_calendar from "../live/calendar.js";
import type * as live_capacity from "../live/capacity.js";
import type * as live_class from "../live/class.js";
import type * as live_cron from "../live/cron.js";
import type * as live_joinAccess from "../live/joinAccess.js";
import type * as live_joinContract from "../live/joinContract.js";
import type * as live_joinPolicy from "../live/joinPolicy.js";
import type * as live_next from "../live/next.js";
import type * as live_reservation from "../live/reservation.js";
import type * as live_room from "../live/room.js";
import type * as live_schedule from "../live/schedule.js";
import type * as live_session from "../live/session.js";
import type * as live_settle from "../live/settle.js";
import type * as liveReminders_create from "../liveReminders/create.js";
import type * as liveReminders_deliver from "../liveReminders/deliver.js";
import type * as liveReminders_process from "../liveReminders/process.js";
import type * as liveReminders_queries from "../liveReminders/queries.js";
import type * as liveReminders_schedule from "../liveReminders/schedule.js";
import type * as livekit_ensureRoom from "../livekit/ensureRoom.js";
import type * as livekit_grants from "../livekit/grants.js";
import type * as livekit_rooms from "../livekit/rooms.js";
import type * as livekit_token from "../livekit/token.js";
import type * as livekit_webhook from "../livekit/webhook.js";
import type * as livekitAttendance_events from "../livekitAttendance/events.js";
import type * as migrations from "../migrations.js";
import type * as muxHttp from "../muxHttp.js";
import type * as muxWebhook from "../muxWebhook.js";
import type * as oneOnOne_cron from "../oneOnOne/cron.js";
import type * as oneOnOne_customer from "../oneOnOne/customer.js";
import type * as oneOnOne_instructor from "../oneOnOne/instructor.js";
import type * as oneOnOne_schedule from "../oneOnOne/schedule.js";
import type * as ops_support from "../ops/support.js";
import type * as profiles_avatar from "../profiles/avatar.js";
import type * as profiles_bootstrap from "../profiles/bootstrap.js";
import type * as profiles_dev from "../profiles/dev.js";
import type * as profiles_roles from "../profiles/roles.js";
import type * as profiles_update from "../profiles/update.js";
import type * as profiles_viewer from "../profiles/viewer.js";
import type * as push_preferences from "../push/preferences.js";
import type * as push_queries from "../push/queries.js";
import type * as push_send from "../push/send.js";
import type * as push_subscribe from "../push/subscribe.js";
import type * as push_subscribeInternal from "../push/subscribeInternal.js";
import type * as subscriptions_admin from "../subscriptions/admin.js";
import type * as subscriptions_customer from "../subscriptions/customer.js";
import type * as subscriptions_internal from "../subscriptions/internal.js";
import type * as subscriptions_lib from "../subscriptions/lib.js";
import type * as subscriptions_plans from "../subscriptions/plans.js";
import type * as subscriptions_schedule from "../subscriptions/schedule.js";
import type * as subscriptions_seed from "../subscriptions/seed.js";
import type * as users_backfill from "../users/backfill.js";
import type * as users_bootstrap from "../users/bootstrap.js";
import type * as users_dashboard from "../users/dashboard.js";
import type * as users_onboarding from "../users/onboarding.js";
import type * as users_session from "../users/session.js";
import type * as users_viewer from "../users/viewer.js";
import type * as video_admin from "../video/admin.js";
import type * as video_catalog from "../video/catalog.js";
import type * as video_categories from "../video/categories.js";
import type * as video_entitlements from "../video/entitlements.js";
import type * as video_migrations from "../video/migrations.js";
import type * as video_playback from "../video/playback.js";
import type * as video_playbackToken from "../video/playbackToken.js";
import type * as video_provider_mux from "../video/provider/mux.js";
import type * as video_uploads from "../video/uploads.js";
import type * as videoInternal_draft from "../videoInternal/draft.js";
import type * as videoInternal_muxAssetAction from "../videoInternal/muxAssetAction.js";
import type * as videoInternal_muxAssetMutations from "../videoInternal/muxAssetMutations.js";
import type * as videoInternal_playback from "../videoInternal/playback.js";
import type * as videoInternal_profile from "../videoInternal/profile.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  "credits/lib": typeof credits_lib;
  "credits/migrate": typeof credits_migrate;
  crons: typeof crons;
  "email/authVerification": typeof email_authVerification;
  "email/liveReminder": typeof email_liveReminder;
  "email/resend": typeof email_resend;
  "email/resendEvents": typeof email_resendEvents;
  http: typeof http;
  "lib/appTime": typeof lib_appTime;
  "lib/authz": typeof lib_authz;
  "lib/constants": typeof lib_constants;
  "lib/displayName": typeof lib_displayName;
  "lib/email": typeof lib_email;
  "lib/equipment": typeof lib_equipment;
  "lib/equipmentCatalog": typeof lib_equipmentCatalog;
  "lib/experienceCatalog": typeof lib_experienceCatalog;
  "lib/featureFlags": typeof lib_featureFlags;
  "lib/goalCatalog": typeof lib_goalCatalog;
  "lib/instructorProfile": typeof lib_instructorProfile;
  "lib/live": typeof lib_live;
  "lib/liveClassAccess": typeof lib_liveClassAccess;
  "lib/liveClassDisplay": typeof lib_liveClassDisplay;
  "lib/liveJoin": typeof lib_liveJoin;
  "lib/liveReminderDelivery": typeof lib_liveReminderDelivery;
  "lib/liveRoom": typeof lib_liveRoom;
  "lib/liveSidebar": typeof lib_liveSidebar;
  "lib/livekitEnv": typeof lib_livekitEnv;
  "lib/normalizeStoredProfile": typeof lib_normalizeStoredProfile;
  "lib/onboardingValidation": typeof lib_onboardingValidation;
  "lib/oneOnOne": typeof lib_oneOnOne;
  "lib/pathologyCatalog": typeof lib_pathologyCatalog;
  "lib/promoteInstructor": typeof lib_promoteInstructor;
  "lib/queryNow": typeof lib_queryNow;
  "lib/rateLimit": typeof lib_rateLimit;
  "lib/validators": typeof lib_validators;
  "lifecycle/repair": typeof lifecycle_repair;
  "live/calendar": typeof live_calendar;
  "live/capacity": typeof live_capacity;
  "live/class": typeof live_class;
  "live/cron": typeof live_cron;
  "live/joinAccess": typeof live_joinAccess;
  "live/joinContract": typeof live_joinContract;
  "live/joinPolicy": typeof live_joinPolicy;
  "live/next": typeof live_next;
  "live/reservation": typeof live_reservation;
  "live/room": typeof live_room;
  "live/schedule": typeof live_schedule;
  "live/session": typeof live_session;
  "live/settle": typeof live_settle;
  "liveReminders/create": typeof liveReminders_create;
  "liveReminders/deliver": typeof liveReminders_deliver;
  "liveReminders/process": typeof liveReminders_process;
  "liveReminders/queries": typeof liveReminders_queries;
  "liveReminders/schedule": typeof liveReminders_schedule;
  "livekit/ensureRoom": typeof livekit_ensureRoom;
  "livekit/grants": typeof livekit_grants;
  "livekit/rooms": typeof livekit_rooms;
  "livekit/token": typeof livekit_token;
  "livekit/webhook": typeof livekit_webhook;
  "livekitAttendance/events": typeof livekitAttendance_events;
  migrations: typeof migrations;
  muxHttp: typeof muxHttp;
  muxWebhook: typeof muxWebhook;
  "oneOnOne/cron": typeof oneOnOne_cron;
  "oneOnOne/customer": typeof oneOnOne_customer;
  "oneOnOne/instructor": typeof oneOnOne_instructor;
  "oneOnOne/schedule": typeof oneOnOne_schedule;
  "ops/support": typeof ops_support;
  "profiles/avatar": typeof profiles_avatar;
  "profiles/bootstrap": typeof profiles_bootstrap;
  "profiles/dev": typeof profiles_dev;
  "profiles/roles": typeof profiles_roles;
  "profiles/update": typeof profiles_update;
  "profiles/viewer": typeof profiles_viewer;
  "push/preferences": typeof push_preferences;
  "push/queries": typeof push_queries;
  "push/send": typeof push_send;
  "push/subscribe": typeof push_subscribe;
  "push/subscribeInternal": typeof push_subscribeInternal;
  "subscriptions/admin": typeof subscriptions_admin;
  "subscriptions/customer": typeof subscriptions_customer;
  "subscriptions/internal": typeof subscriptions_internal;
  "subscriptions/lib": typeof subscriptions_lib;
  "subscriptions/plans": typeof subscriptions_plans;
  "subscriptions/schedule": typeof subscriptions_schedule;
  "subscriptions/seed": typeof subscriptions_seed;
  "users/backfill": typeof users_backfill;
  "users/bootstrap": typeof users_bootstrap;
  "users/dashboard": typeof users_dashboard;
  "users/onboarding": typeof users_onboarding;
  "users/session": typeof users_session;
  "users/viewer": typeof users_viewer;
  "video/admin": typeof video_admin;
  "video/catalog": typeof video_catalog;
  "video/categories": typeof video_categories;
  "video/entitlements": typeof video_entitlements;
  "video/migrations": typeof video_migrations;
  "video/playback": typeof video_playback;
  "video/playbackToken": typeof video_playbackToken;
  "video/provider/mux": typeof video_provider_mux;
  "video/uploads": typeof video_uploads;
  "videoInternal/draft": typeof videoInternal_draft;
  "videoInternal/muxAssetAction": typeof videoInternal_muxAssetAction;
  "videoInternal/muxAssetMutations": typeof videoInternal_muxAssetMutations;
  "videoInternal/playback": typeof videoInternal_playback;
  "videoInternal/profile": typeof videoInternal_profile;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  mux: import("@mux/convex/_generated/component.js").ComponentApi<"mux">;
  resend: import("@convex-dev/resend/_generated/component.js").ComponentApi<"resend">;
};
