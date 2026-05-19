<script lang="ts">
  import { api } from "$convex/_generated/api";
  import { initAuth, getCachedRole, signOut } from "$lib/auth/session.svelte";
  import { useQuery } from "convex-svelte";
  import { routePath, liveRoomHref } from "$lib/i18n/context";

  let { role: roleProp }: { role?: "customer" | "instructor" | "admin" | null } = $props();

  const auth = initAuth();

  // Use prop if provided, otherwise fall back to cached role from localStorage.
  // No async fetch = no layout jump on MPA navigation.
  const role = $derived(roleProp ?? (getCachedRole() as "customer" | "instructor" | "admin" | null) ?? "customer");
  const isStaff = $derived(role === "instructor" || role === "admin");

  const customerNav = [
    { href: routePath("dashboard"), label: "סקירה" },
    { href: routePath("customerCalendar"), label: "לוח לייבים" },
    { href: routePath("customerOneOnOne"), label: "1:1 אישי" },
    { href: routePath("customerVideos"), label: "וידאו" },
    { href: routePath("profile"), label: "פרופיל פילאטיס" },
  ];

  const staffNav = [
    { href: routePath("dashboard"), label: "סקירה" },
    { href: routePath("studioLive"), label: "סטודיו לייב" },
    { href: routePath("studioVideos"), label: "ניהול וידאו" },
    { href: routePath("profile"), label: "פרופיל מדריכה" },
  ];

  const nextLiveQuery = useQuery(api.liveClasses.myNextLiveClass, () => auth.isAuthenticated ? {} : "skip");
  const nextLive = $derived(nextLiveQuery.data ?? null);
  const showLiveTab = $derived(nextLive !== null && nextLive.status !== "ended" && nextLive.status !== "cancelled");

  const baseNav = $derived(isStaff ? staffNav : customerNav);
  const navItems = $derived(showLiveTab
    ? [{ href: liveRoomHref(nextLive!.classId), label: "LIVE", isLive: true }, ...baseNav]
    : baseNav
  );

  let currentPath = $state(typeof window !== "undefined" ? window.location.pathname : "");

  if (typeof window !== "undefined") {
    window.addEventListener("popstate", () => {
      currentPath = window.location.pathname;
    });
  }

  function isCurrent(href: string) {
    if (href.startsWith(routePath("liveRoom"))) return currentPath === routePath("liveRoom");
    return currentPath === href;
  }
</script>

<aside class="sidebar" aria-label="ניווט אזור אישי">
  <div class="sidebar__brand">
    <span class="sidebar__tagline">{isStaff ? "סטודיו" : "אזור אישי"}</span>
    {#if isStaff}
      <span class="role-badge role-badge--{role}">{role === "admin" ? "Admin" : "Instructor"}</span>
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
    transition: background var(--duration-fast), color var(--duration-fast);
    border-inline-end: 3px solid transparent;
  }

  .sidebar__link:hover {
    background: var(--surface);
    color: var(--sky-strong);
  }

  .sidebar__link[aria-current="page"] {
    font-weight: 700;
    background: var(--surface);
    border-inline-end-color: var(--ink);
  }

  .sidebar__link--live {
    background: #fff1f0;
    color: #c93322;
    font-weight: 800;
    border-inline-end-color: #c93322;
  }

  .sidebar__link--live[aria-current="page"] {
    background: #c93322;
    color: #fff;
    border-inline-end-color: #c93322;
  }

  .live-pulse {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #c93322;
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

    .sidebar__account {
      display: none;
    }
  }
</style>
