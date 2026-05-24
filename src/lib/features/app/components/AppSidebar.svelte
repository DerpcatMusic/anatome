<script lang="ts">
  import { page } from "$app/state";
  import { api } from "$convex/_generated/api";
  import { initAuth, signOut } from "$lib/auth/session.svelte";
  import { useQuery } from "convex-svelte";
  import { getAppContext } from "$features/app/context/appContext";
  import { liveRoomHref } from "$lib/i18n/context";
  import { theme } from "$features/app/theme.svelte";
  import "./AppSidebar.css";

  const auth = initAuth();
  const ctx = getAppContext();

  // Route-based prefix: /u or /i. For shared pages (live-room, watch), fall back to role.
  const prefix = $derived.by(() => {
    const path = page.url.pathname;
    if (path.startsWith("/i/")) return "/i";
    if (path.startsWith("/u/")) return "/u";
    // Shared pages: use actual role from context
    return ctx.role === "instructor" || ctx.role === "admin" ? "/i" : "/u";
  });
  const isInstructorPrefix = $derived(prefix === "/i");

  const navMap: Record<string, { href: string; label: string }[]> = {
    "/u": [
      { href: "/u/dashboard", label: "סקירה" },
      { href: "/u/calendar", label: "לוח לייבים" },
      { href: "/u/videos", label: "וידאו" },
      { href: "/u/profile", label: "פרופיל פילאטיס" },
    ],
    "/i": [
      { href: "/i/dashboard", label: "סקירה" },
      { href: "/i/live", label: "סטודיו לייב" },
      { href: "/i/videos", label: "ניהול וידאו" },
      { href: "/i/profile", label: "פרופיל מדריכה" },
    ],
  };

  const nextLiveQuery = useQuery(api.live.next.get, () => auth.isAuthenticated ? {} : "skip");
  const nextLive = $derived(nextLiveQuery.data ?? null);
  const showLiveTab = $derived(nextLive !== null && nextLive.status !== "ended" && nextLive.status !== "cancelled");

  const baseNav = $derived(navMap[prefix] ?? navMap["/u"]);
  const navItems = $derived(showLiveTab
    ? [{ href: liveRoomHref(nextLive!.classId), label: "LIVE", isLive: true }, ...baseNav]
    : baseNav
  );

  const currentPath = $derived(page.url.pathname);

  function isCurrent(href: string) {
    if (href.includes("classId=")) {
      return currentPath === "/חדר-לייב" || currentPath === "/live-room";
    }
    return currentPath === href;
  }
</script>

<aside class="sidebar" aria-label="ניווט אזור אישי">
  <div class="sidebar__brand">
    <span class="sidebar__tagline">{isInstructorPrefix ? "סטודיו" : "אזור אישי"}</span>
    {#if isInstructorPrefix && ctx.role}
      <span class="role-badge role-badge--{ctx.role}">{ctx.role === "admin" ? "Admin" : "Instructor"}</span>
    {/if}
  </div>

  <div class="sidebar__account">
    {#if auth.isAuthenticated}
      <span class="sidebar__user">מחוברת</span>
      <div class="sidebar__actions">
        <button
          type="button"
          class="theme-toggle"
          onclick={() => theme.toggle()}
          title={theme.isDark ? "מעבר למצב בהיר" : "מעבר למצב כהה"}
          aria-label={theme.isDark ? "מעבר למצב בהיר" : "מעבר למצב כהה"}
        >
          <span class="material-symbols-rounded">
            {theme.isDark ? "light_mode" : "dark_mode"}
          </span>
        </button>
        <button type="button" class="sidebar__signout" onclick={signOut}>יציאה</button>
      </div>
    {:else}
      <a href="/" class="sidebar__signout">כניסה</a>
    {/if}
  </div>

  <nav class="sidebar__nav" aria-label="ניווט פנימי">
    {#each navItems as item}
      <a
        href={item.href}
        class="sidebar__link"
        class:sidebar__link--live={"isLive" in item && item.isLive}
        aria-current={isCurrent(item.href) ? "page" : undefined}
      >
        {#if "isLive" in item && item.isLive}
          <span class="live-pulse"></span>
        {/if}
        {item.label}
      </a>
    {/each}
  </nav>
</aside>

