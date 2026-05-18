<script lang="ts">
  import { initAuth, getCachedRole, signOut } from "../../lib/auth/session.svelte";

  let { role: roleProp }: { role?: "customer" | "instructor" | "admin" | null } = $props();

  const auth = initAuth();

  // Use prop if provided, otherwise fall back to cached role from localStorage.
  // No async fetch = no layout jump on MPA navigation.
  const role = $derived(roleProp ?? (getCachedRole() as "customer" | "instructor" | "admin" | null) ?? "customer");
  const isStaff = $derived(role === "instructor" || role === "admin");

  const customerNav = [
    { href: "/dashboard", label: "סקירה" },
    { href: "/calendar", label: "לוח לייבים" },
    { href: "/videos", label: "וידאו" },
    { href: "/profile", label: "פרופיל פילאטיס" },
  ];

  const staffNav = [
    { href: "/dashboard", label: "סקירה" },
    { href: "/live", label: "סטודיו" },
    { href: "/calendar", label: "לוח לייבים" },
    { href: "/videos", label: "וידאו" },
  ];

  const navItems = $derived(isStaff ? staffNav : customerNav);

  let currentPath = $state(typeof window !== "undefined" ? window.location.pathname : "");

  if (typeof window !== "undefined") {
    window.addEventListener("popstate", () => {
      currentPath = window.location.pathname;
    });
  }

  function isCurrent(href: string) {
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

  <nav class="sidebar__nav" aria-label="ניווט פנימי">
    {#each navItems as item}
      <a
        href={item.href}
        class="sidebar__link"
        aria-current={isCurrent(item.href) ? "page" : undefined}
      >
        {item.label}
      </a>
    {/each}
  </nav>

  <div class="sidebar__footer">
    {#if auth.isAuthenticated}
      <span class="sidebar__user">מחוברת</span>
      <button type="button" class="sidebar__signout" onclick={signOut}>יציאה</button>
    {:else}
      <a href="/" class="sidebar__signout">כניסה</a>
    {/if}
  </div>
</aside>

<style>
  .sidebar {
    display: flex;
    flex-direction: column;
    gap: 0;
    width: 260px;
    flex-shrink: 0;
    background: var(--white);
    border-inline-end: 1px solid var(--line);
    height: calc(100vh - 56px);
    min-height: calc(100vh - 56px);
    position: sticky;
    top: 56px;
    align-self: start;
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
    flex: 1;
    padding: var(--space-2) 0;
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

  /* ─── Footer ─── */
  .sidebar__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    padding: var(--space-4) clamp(16px, 3vw, 32px);
    border-top: var(--border);
    margin-top: auto;
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

    .sidebar__footer {
      display: none;
    }
  }
</style>
