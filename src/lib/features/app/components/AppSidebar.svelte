<script lang="ts">
  import { page } from "$app/state";
  import { api } from "$convex/_generated/api";
  import { initAuth, signOut } from "$lib/auth/session.svelte";
  import { useQuery } from "convex-svelte";
  import { getAppContext } from "$features/app/context/appContext";
  import { liveRoomHref } from "$lib/i18n/context";

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
      { href: "/u/one-on-one", label: "1:1 אישי" },
      { href: "/u/videos", label: "וידאו" },
      { href: "/u/profile", label: "פרופיל פילאטיס" },
    ],
    "/i": [
      { href: "/i/dashboard", label: "סקירה" },
      { href: "/i/live", label: "סטודיו לייב" },
      { href: "/i/videos", label: "ניהול וידאו" },
      { href: "/i/one-on-one", label: "ניהול 1:1" },
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
    if (href.startsWith("/live-room")) return currentPath === "/live-room";
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
      <button type="button" class="sidebar__signout" onclick={signOut}>יציאה</button>
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

<style>
  .sidebar {
    display: flex;
    flex-direction: column;
    gap: 0;
    width: 100%;
    flex-shrink: 0;
    background: var(--white);
    border-inline-end: 1px solid var(--line);
    height: 100%;
    min-height: 0;
    z-index: 10;
    overflow: hidden;
  }

  /* ─── Brand header ─── */
  .sidebar__brand {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: var(--space-2);
    padding: var(--space-5) clamp(16px, 3vw, 32px) var(--space-4);
    border-bottom: var(--border);
  }

  .sidebar__tagline {
    font-size: var(--step-0);
    color: var(--muted);
    font-weight: 600;
  }

  .role-badge {
    font-family: var(--font-mono);
    font-size: var(--step--2);
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding: 2px 8px;
    border: var(--border);
    margin-inline-start: auto;
  }

  .role-badge--admin {
    background: var(--ink);
    color: var(--white);
    border-color: var(--ink);
  }

  .role-badge--instructor {
    background: var(--sky);
    color: var(--ink);
    border-color: var(--line);
  }

  /* ─── Navigation ─── */
  .sidebar__nav {
    display: flex;
    flex-direction: column;
    min-height: 0;
    padding: var(--space-2) 0 var(--space-4);
    overflow-y: auto;
  }

  .sidebar__link {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) clamp(16px, 3vw, 32px);
    color: var(--ink);
    font-size: var(--step-0);
    font-weight: 600;
    text-decoration: none;
    border-radius: 0;
    transition:
      background 0.15s var(--ease-out),
      color 0.15s var(--ease-out);
    border-inline-end: 3px solid transparent;
  }

  .sidebar__link:hover {
    background: var(--surface);
    color: var(--sky-strong);
  }

  .sidebar__link[aria-current="page"] {
    font-weight: 800;
    background: var(--surface);
    border-inline-end-color: var(--ink);
  }

  .sidebar__link--live {
    color: var(--danger);
    font-weight: 800;
  }
 
  .sidebar__link--live:hover {
    background: var(--danger-soft);
  }
 
  .sidebar__link--live[aria-current="page"] {
    background: var(--danger);
    color: var(--white);
    border-inline-end-color: var(--danger);
  }
 
  .live-pulse {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--danger);
    animation: pulse-dot 1.5s ease-in-out infinite;
    display: inline-block;
    margin-inline-end: var(--space-2);
  }

  @keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.3); }
  }

  /* ─── Account ─── */
  .sidebar__account {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    padding: var(--space-3) clamp(16px, 3vw, 32px);
    border-bottom: var(--border);
    background: var(--surface);
  }

  .sidebar__user {
    font-family: var(--font-mono);
    font-size: var(--step--1);
    color: var(--muted);
  }

  .sidebar__signout {
    border: 0;
    background: transparent;
    color: var(--muted);
    font: inherit;
    font-size: var(--step--1);
    font-weight: 700;
    cursor: pointer;
    text-decoration: none;
    transition: color var(--duration-fast);
  }

  .sidebar__signout:hover {
    color: var(--ink);
  }

  /* ─── Mobile: horizontal nav strip ─── */
  @media (max-width: 860px) {
    .sidebar {
      width: 100%;
      height: auto;
      min-height: auto;
      position: static;
      border-inline-end: 0;
      border-bottom: var(--border);
      overflow: visible;
    }

    .sidebar__brand {
      padding: var(--space-3) 16px;
    }

    .sidebar__nav {
      flex-direction: row;
      flex-wrap: wrap;
      gap: var(--space-1);
      padding: var(--space-2) 16px;
    }

    .sidebar__link {
      padding: var(--space-2) var(--space-3);
      border: var(--border);
      border-inline-end: var(--border);
      font-size: var(--step--1);
    }

    .sidebar__link[aria-current="page"] {
      background: var(--ink);
      color: var(--white);
      border-color: var(--ink);
    }

    .sidebar__link--live[aria-current="page"] {
      background: var(--danger);
      border-color: var(--danger);
    }

    .sidebar__account {
      display: none;
    }
  }
</style>
