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
import type * as credits_consumeLive from "../credits/consumeLive.js";
import type * as credits_consumeOneOnOne from "../credits/consumeOneOnOne.js";
import type * as credits_lib from "../credits/lib.js";
import type * as credits_purchaseVod from "../credits/purchaseVod.js";
import type * as credits_releaseLive from "../credits/releaseLive.js";
import type * as credits_releaseOneOnOne from "../credits/releaseOneOnOne.js";
import type * as credits_reserveLive from "../credits/reserveLive.js";
import type * as credits_reserveOneOnOne from "../credits/reserveOneOnOne.js";
import type * as crons from "../crons.js";
import type * as http from "../http.js";
import type * as lib_authz from "../lib/authz.js";
import type * as lib_equipment from "../lib/equipment.js";
import type * as lib_livekitEnv from "../lib/livekitEnv.js";
import type * as lib_oneOnOne from "../lib/oneOnOne.js";
import type * as lib_validators from "../lib/validators.js";
import type * as live_calendar from "../live/calendar.js";
import type * as live_class from "../live/class.js";
import type * as live_cron from "../live/cron.js";
import type * as live_next from "../live/next.js";
import type * as live_reservation from "../live/reservation.js";
import type * as live_room from "../live/room.js";
import type * as live_settle from "../live/settle.js";
import type * as liveReminders_process from "../liveReminders/process.js";
import type * as livekit_rooms from "../livekit/rooms.js";
import type * as livekit_token from "../livekit/token.js";
import type * as livekit_webhook from "../livekit/webhook.js";
import type * as livekitAttendance_events from "../livekitAttendance/events.js";
import type * as livekitWebhook from "../livekitWebhook.js";
import type * as oneOnOne_cron from "../oneOnOne/cron.js";
import type * as oneOnOne_customer from "../oneOnOne/customer.js";
import type * as oneOnOne_instructor from "../oneOnOne/instructor.js";
import type * as profiles_bootstrap from "../profiles/bootstrap.js";
import type * as profiles_dev from "../profiles/dev.js";
import type * as profiles_roles from "../profiles/roles.js";
import type * as profiles_update from "../profiles/update.js";
import type * as profiles_viewer from "../profiles/viewer.js";
import type * as users_dashboard from "../users/dashboard.js";
import type * as users_onboarding from "../users/onboarding.js";
import type * as users_viewer from "../users/viewer.js";
import type * as video_admin from "../video/admin.js";
import type * as video_catalog from "../video/catalog.js";
import type * as video_categories from "../video/categories.js";
import type * as video_entitlements from "../video/entitlements.js";
import type * as video_playback from "../video/playback.js";
import type * as video_playbackToken from "../video/playbackToken.js";
import type * as video_provider_mux from "../video/provider/mux.js";
import type * as video_uploads from "../video/uploads.js";
import type * as videoInternal_draft from "../videoInternal/draft.js";
import type * as videoInternal_playback from "../videoInternal/playback.js";
import type * as videoInternal_profile from "../videoInternal/profile.js";
import type * as videoInternal_upload from "../videoInternal/upload.js";
import type * as videoInternal_webhook from "../videoInternal/webhook.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  "credits/consumeLive": typeof credits_consumeLive;
  "credits/consumeOneOnOne": typeof credits_consumeOneOnOne;
  "credits/lib": typeof credits_lib;
  "credits/purchaseVod": typeof credits_purchaseVod;
  "credits/releaseLive": typeof credits_releaseLive;
  "credits/releaseOneOnOne": typeof credits_releaseOneOnOne;
  "credits/reserveLive": typeof credits_reserveLive;
  "credits/reserveOneOnOne": typeof credits_reserveOneOnOne;
  crons: typeof crons;
  http: typeof http;
  "lib/authz": typeof lib_authz;
  "lib/equipment": typeof lib_equipment;
  "lib/livekitEnv": typeof lib_livekitEnv;
  "lib/oneOnOne": typeof lib_oneOnOne;
  "lib/validators": typeof lib_validators;
  "live/calendar": typeof live_calendar;
  "live/class": typeof live_class;
  "live/cron": typeof live_cron;
  "live/next": typeof live_next;
  "live/reservation": typeof live_reservation;
  "live/room": typeof live_room;
  "live/settle": typeof live_settle;
  "liveReminders/process": typeof liveReminders_process;
  "livekit/rooms": typeof livekit_rooms;
  "livekit/token": typeof livekit_token;
  "livekit/webhook": typeof livekit_webhook;
  "livekitAttendance/events": typeof livekitAttendance_events;
  livekitWebhook: typeof livekitWebhook;
  "oneOnOne/cron": typeof oneOnOne_cron;
  "oneOnOne/customer": typeof oneOnOne_customer;
  "oneOnOne/instructor": typeof oneOnOne_instructor;
  "profiles/bootstrap": typeof profiles_bootstrap;
  "profiles/dev": typeof profiles_dev;
  "profiles/roles": typeof profiles_roles;
  "profiles/update": typeof profiles_update;
  "profiles/viewer": typeof profiles_viewer;
  "users/dashboard": typeof users_dashboard;
  "users/onboarding": typeof users_onboarding;
  "users/viewer": typeof users_viewer;
  "video/admin": typeof video_admin;
  "video/catalog": typeof video_catalog;
  "video/categories": typeof video_categories;
  "video/entitlements": typeof video_entitlements;
  "video/playback": typeof video_playback;
  "video/playbackToken": typeof video_playbackToken;
  "video/provider/mux": typeof video_provider_mux;
  "video/uploads": typeof video_uploads;
  "videoInternal/draft": typeof videoInternal_draft;
  "videoInternal/playback": typeof videoInternal_playback;
  "videoInternal/profile": typeof videoInternal_profile;
  "videoInternal/upload": typeof videoInternal_upload;
  "videoInternal/webhook": typeof videoInternal_webhook;
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

export declare const components: {};
