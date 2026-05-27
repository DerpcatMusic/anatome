/** In-app live room routes (Hebrew + legacy alias). */
export const LIVE_ROOM_PATHS = ["/חדר-לייב", "/live-room"] as const;

function normalizePathname(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, "") || "/";
  try {
    return decodeURIComponent(trimmed);
  } catch {
    return trimmed;
  }
}

export function isLiveRoomPath(pathname: string): boolean {
  const path = normalizePathname(pathname);
  return (LIVE_ROOM_PATHS as readonly string[]).includes(path);
}

/** Member / instructor shell tabs (sidebar navigation). */
export function isAppShellPath(pathname: string): boolean {
  return /^\/(u|i)\//.test(pathname);
}
