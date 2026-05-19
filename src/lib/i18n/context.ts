import { getContext, setContext } from "svelte";
import { t, tFormat, type Locale, type TranslationKey, defaultLocale } from "./dictionary";

export type RouteKey =
  | "dashboard"
  | "customerCalendar"
  | "customerOneOnOne"
  | "customerVideos"
  | "watch"
  | "profile"
  | "onboarding"
  | "liveRoom"
  | "studioLive"
  | "studioVideos";

const I18N_KEY = Symbol("i18n");

const routes: Record<RouteKey, string> = {
  dashboard: "/dashboard",
  customerCalendar: "/calendar",
  customerOneOnOne: "/one-on-one",
  customerVideos: "/videos",
  watch: "/watch",
  profile: "/profile",
  onboarding: "/onboarding",
  liveRoom: "/live-room",
  studioLive: "/live",
  studioVideos: "/studio/videos",
};

export type I18nContext = {
  locale: Locale;
  t: (key: TranslationKey) => string;
  tFormat: (key: TranslationKey, values: Record<string, string | number>) => string;
};

export function createI18nContext(locale: Locale = defaultLocale): I18nContext {
  const ctx: I18nContext = {
    locale,
    t: (key: TranslationKey) => t(key, locale),
    tFormat: (key: TranslationKey, values: Record<string, string | number>) => tFormat(key, values, locale),
  };
  setContext(I18N_KEY, ctx);
  return ctx;
}

export function getI18n(): I18nContext {
  return getContext(I18N_KEY) ?? createI18nContext();
}

export function routePath(key: RouteKey, locale: Locale = defaultLocale): string {
  void locale;
  return routes[key];
}

export function liveRoomHref(classId: string, locale: Locale = defaultLocale): string {
  return `${routePath("liveRoom", locale)}?classId=${classId}`;
}

export function watchHref(videoId: string, locale: Locale = defaultLocale): string {
  return `${routePath("watch", locale)}?videoId=${videoId}`;
}
