import { liveRoomHref, routePath } from "$lib/i18n/context";
import { isLiveRoomPath } from "$lib/features/live/dock/live-dock-paths";

export type AppNavTone = "dashboard" | "calendar" | "video" | "profile" | "live";

export type AppNavItem = {
  href: string;
  label: string;
  tabLabel: string;
  icon: string;
  tone: AppNavTone;
  isLive?: boolean;
};

export type AppRole = "customer" | "instructor" | "admin" | null;

const NAV_BY_PREFIX: Record<"/u" | "/i", AppNavItem[]> = {
  "/u": [
    {
      href: "/u/dashboard",
      label: "סקירה",
      tabLabel: "סקירה",
      icon: "dashboard",
      tone: "dashboard",
    },
    {
      href: "/u/calendar",
      label: "לייבים",
      tabLabel: "לייבים",
      icon: "calendar_month",
      tone: "calendar",
    },
    {
      href: "/u/library",
      label: "וידאו",
      tabLabel: "וידאו",
      icon: "play_lesson",
      tone: "video",
    },
  ],
  "/i": [
    {
      href: "/i/dashboard",
      label: "סקירה",
      tabLabel: "סקירה",
      icon: "dashboard",
      tone: "dashboard",
    },
    {
      href: routePath("iCalendar"),
      label: "לוח שנה",
      tabLabel: "לוח",
      icon: "calendar_month",
      tone: "calendar",
    },
    {
      href: "/i/videos",
      label: "וידאו",
      tabLabel: "וידאו",
      icon: "video_library",
      tone: "video",
    },
  ],
};

export function resolveAppNavPrefix(
  pathname: string,
  role: AppRole,
): "/u" | "/i" {
  if (pathname.startsWith("/i/")) return "/i";
  if (pathname.startsWith("/u/")) return "/u";
  return role === "instructor" || role === "admin" ? "/i" : "/u";
}

export function baseAppNavItems(prefix: "/u" | "/i"): AppNavItem[] {
  return NAV_BY_PREFIX[prefix];
}

export function isAppNavCurrent(pathname: string, href: string): boolean {
  if (href.includes("classId=")) {
    return isLiveRoomPath(pathname);
  }
  return pathname === href;
}

type LiveNavInput = {
  classId: string;
  status: string;
};

export function buildLiveNavItem(
  nextLive: LiveNavInput,
  isInstructorPrefix: boolean,
  labels: {
    enterRoom: string;
    preConnectTitle: string;
  },
): AppNavItem {
  const isBroadcastLive = nextLive.status === "live";
  if (isInstructorPrefix) {
    return {
      href: liveRoomHref(nextLive.classId),
      label: isBroadcastLive ? labels.enterRoom : labels.preConnectTitle,
      tabLabel: isBroadcastLive ? "לייב" : "הכנה",
      icon: isBroadcastLive ? "sensors" : "video_settings",
      tone: isBroadcastLive ? "live" : "calendar",
      isLive: isBroadcastLive,
    };
  }
  return {
    href: liveRoomHref(nextLive.classId),
    label: labels.enterRoom,
    tabLabel: "לייב",
    icon: "sensors",
    tone: "live",
    isLive: true,
  };
}

export function mergeAppNavItems(
  baseNav: AppNavItem[],
  liveNavItem: AppNavItem | null,
): AppNavItem[] {
  return liveNavItem ? [liveNavItem, ...baseNav] : baseNav;
}

/** Bottom tab bar shows primary routes only (live replaces calendar slot when active). */
export function bottomTabNavItems(
  baseNav: AppNavItem[],
  liveNavItem: AppNavItem | null,
): AppNavItem[] {
  if (!liveNavItem) return baseNav;
  const withoutCalendar = baseNav.filter((item) => item.tone !== "calendar");
  return [liveNavItem, ...withoutCalendar];
}
