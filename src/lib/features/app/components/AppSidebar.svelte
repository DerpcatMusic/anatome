<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { Tooltip } from "bits-ui";
  import { api } from "$convex/_generated/api";
  import { initAuth, signOut, canRunAuthenticatedQuery } from "$lib/auth/session.svelte";
  import { useQueryNowMs } from "$lib/convex/queryClock.svelte";
  import { useQuery } from "convex-svelte";
  import PlanBadge from "$lib/features/subscriptions/components/PlanBadge.svelte";
  import { getAppContext } from "$features/app/context/appContext";
  import { liveRoomHref, routePath } from "$lib/i18n/context";
  import { isLiveRoomPath } from "$lib/features/live/dock/live-dock-paths";
  import { theme } from "$features/app/theme.svelte";
  import { sidebar } from "$features/app/sidebar.svelte";
  import { useI18n } from "$lib/i18n/runes";
  import WalletCreditStrip from "$lib/features/credits/WalletCreditStrip.svelte";
  import { walletBalances } from "$lib/features/credits/balances";
  import { poolsForSidebar } from "$lib/features/credits/pools-for-context";
  import SidebarNavLink, { type SidebarNavTone } from "./SidebarNavLink.svelte";
  import "./AppSidebar.css";

  type NavItem = {
    href: string;
    label: string;
    icon: string;
    tone: SidebarNavTone;
    isLive?: boolean;
  };

  const auth = initAuth();
  const ctx = getAppContext();
  const { t } = useI18n();

  const siteInitial = $derived(t.site.name().trim().slice(0, 1) || "A");

  const prefix = $derived.by(() => {
    const path = page.url.pathname;
    if (path.startsWith("/i/")) return "/i";
    if (path.startsWith("/u/")) return "/u";
    return ctx.role === "instructor" || ctx.role === "admin" ? "/i" : "/u";
  });
  const isInstructorPrefix = $derived(prefix === "/i");

  const navMap: Record<string, NavItem[]> = {
    "/u": [
      { href: "/u/dashboard", label: "סקירה", icon: "dashboard", tone: "dashboard" },
      { href: "/u/calendar", label: "לייבים", icon: "calendar_month", tone: "calendar" },
      { href: "/u/library", label: "וידאו", icon: "play_lesson", tone: "video" },
      { href: "/u/profile", label: "פרופיל", icon: "account_circle", tone: "profile" },
    ],
    "/i": [
      { href: "/i/dashboard", label: "סקירה", icon: "dashboard", tone: "dashboard" },
      {
        href: routePath("iCalendar"),
        label: "לוח שנה",
        icon: "calendar_month",
        tone: "calendar",
      },
      { href: "/i/videos", label: "וידאו", icon: "video_library", tone: "video" },
      { href: "/i/profile", label: "פרופיל", icon: "account_circle", tone: "profile" },
    ],
  };

  const profile = $derived(ctx.viewer);

  let subscriptionReady = $state(false);
  onMount(() => {
    const stopRailQuery = sidebar.initRailQuery();
    const enable = () => {
      subscriptionReady = true;
    };
    let stopIdle: (() => void) | undefined;
    if (typeof requestIdleCallback === "function") {
      const id = requestIdleCallback(enable, { timeout: 400 });
      stopIdle = () => cancelIdleCallback(id);
    } else {
      const id = requestAnimationFrame(enable);
      stopIdle = () => cancelAnimationFrame(id);
    }
    return () => {
      stopRailQuery();
      stopIdle?.();
    };
  });

  const queryNow = useQueryNowMs();
  const subscriptionQuery = useQuery(api.subscriptions.customer.getMine, () =>
    canRunAuthenticatedQuery() && subscriptionReady && !isInstructorPrefix
      ? { now: queryNow.nowMs }
      : "skip",
  );
  const currentPlan = $derived(subscriptionQuery.data?.plan ?? null);
  const creditBalances = $derived(walletBalances(subscriptionQuery.data?.wallet ?? null));
  const showCreditStrip = $derived(
    auth.isAuthenticated && !isInstructorPrefix && !sidebar.isCollapsed,
  );
  const userLabel = $derived.by(() => {
    if (!auth.isAuthenticated) return null;
    const name = profile?.displayName?.trim();
    if (name) return name;
    const email = profile?.email?.trim();
    if (email) return email;
    return "מחוברת";
  });

  const nextLiveQuery = useQuery(api.live.next.get, () =>
    canRunAuthenticatedQuery() ? { now: queryNow.nowMs } : "skip",
  );
  const nextLive = $derived(nextLiveQuery.data ?? null);
  const showLiveTab = $derived(nextLive !== null);

  const baseNav = $derived(navMap[prefix] ?? navMap["/u"]);
  const navItems = $derived(
    showLiveTab
      ? [
          {
            href: liveRoomHref(nextLive!.classId),
            label: "כניסה לשידור",
            icon: "sensors",
            tone: "live" as const,
            isLive: true,
          },
          ...baseNav,
        ]
      : baseNav,
  );

  const currentPath = $derived(page.url.pathname);

  function isCurrent(href: string) {
    if (href.includes("classId=")) {
      return isLiveRoomPath(currentPath);
    }
    return currentPath === href;
  }

  const themeLabel = $derived(theme.isDark ? "מעבר למצב בהיר" : "מעבר למצב כהה");

  const collapseLabel = $derived(
    sidebar.isCollapsed ? "הרחבת תפריט צד" : "כיווץ תפריט צד",
  );
  const collapseHint = $derived(
    sidebar.isCollapsed ? "הרחבת תפריט (Ctrl+B)" : "כיווץ תפריט (Ctrl+B)",
  );
</script>

<aside
  class="sidebar"
  class:sidebar--collapsed={sidebar.isCollapsed}
  data-collapsed={sidebar.isCollapsed ? "" : undefined}
  aria-label="ניווט אזור אישי"
>
  <header class="sidebar__brand">
    <div class="sidebar__brand-row">
      <a class="sidebar__home" href="/" aria-label="{t.site.name()} — {t.site.tagline()}">
        {#if sidebar.isCollapsed}
          <span class="sidebar__logo-mark" aria-hidden="true">{siteInitial}</span>
        {:else}
          <span class="sidebar__logo">{t.site.name()}</span>
        {/if}
      </a>
      <button
        type="button"
        class="sidebar__ghost-btn sidebar__ghost-btn--collapse"
        onclick={() => sidebar.toggle()}
        aria-expanded={!sidebar.isCollapsed}
        aria-label={collapseLabel}
        title={collapseHint}
      >
        <span class="material-symbols-rounded" aria-hidden="true">
          {sidebar.isCollapsed ? "right_panel_open" : "right_panel_close"}
        </span>
      </button>
    </div>
    {#if !sidebar.isCollapsed}
      <div class="sidebar__area">
        <span class="sidebar__area-label">{isInstructorPrefix ? "סטודיו" : "אישי"}</span>
        {#if isInstructorPrefix && ctx.role}
          <span class="role-badge role-badge--{ctx.role}">
            {ctx.role === "admin" ? "Admin" : "Instructor"}
          </span>
        {/if}
      </div>
    {/if}
  </header>

  <nav class="sidebar__nav" aria-label="ניווט פנימי">
    {#each navItems as item (item.href)}
      <SidebarNavLink
        href={item.href}
        label={item.label}
        icon={item.icon}
        tone={item.tone}
        live={item.isLive === true}
        current={isCurrent(item.href)}
      />
    {/each}
  </nav>

  {#if showCreditStrip}
    <div class="sidebar__credits">
      <WalletCreditStrip
        balances={creditBalances}
        pools={poolsForSidebar()}
        size="sm"
        layout="stack"
        variant="minimal"
      />
    </div>
  {/if}

  <footer class="sidebar__footer">
    {#if auth.isAuthenticated}
      <div class="sidebar__user">
        {#if profile?.avatarUrl}
          <img class="sidebar__avatar" src={profile.avatarUrl} alt="" width="36" height="36" />
        {:else}
          <span class="sidebar__avatar sidebar__avatar--placeholder" aria-hidden="true">
            {userLabel?.slice(0, 1) ?? "?"}
          </span>
        {/if}
        {#if !sidebar.isCollapsed}
          <div class="sidebar__user-meta">
            <span class="sidebar__user-label">{userLabel}</span>
            {#if currentPlan}
              <PlanBadge planName={currentPlan.nameHe} planSlug={currentPlan.slug} size="sm" />
            {/if}
          </div>
        {/if}
      </div>
      <div class="sidebar__footer-actions">
        {#if sidebar.isCollapsed}
          <Tooltip.Root>
            <Tooltip.Trigger>
              {#snippet child({ props })}
                <button
                  {...props}
                  type="button"
                  class="sidebar__ghost-btn sidebar__ghost-btn--theme"
                  onclick={() => theme.toggle()}
                  aria-label={themeLabel}
                >
                  <span class="material-symbols-rounded" aria-hidden="true">
                    {theme.isDark ? "light_mode" : "dark_mode"}
                  </span>
                </button>
              {/snippet}
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content class="hb-tooltip-content sidebar__nav-tooltip" side="left" sideOffset={8}>
                {themeLabel}
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
          <Tooltip.Root>
            <Tooltip.Trigger>
              {#snippet child({ props })}
                <button
                  {...props}
                  type="button"
                  class="sidebar__ghost-btn sidebar__ghost-btn--signout"
                  onclick={signOut}
                  aria-label="יציאה מהחשבון"
                >
                  <span class="material-symbols-rounded" aria-hidden="true">logout</span>
                </button>
              {/snippet}
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content class="hb-tooltip-content sidebar__nav-tooltip" side="left" sideOffset={8}>
                יציאה מהחשבון
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        {:else}
          <button
            type="button"
            class="sidebar__ghost-btn sidebar__ghost-btn--theme"
            onclick={() => theme.toggle()}
            title={themeLabel}
            aria-label={themeLabel}
          >
            <span class="material-symbols-rounded" aria-hidden="true">
              {theme.isDark ? "light_mode" : "dark_mode"}
            </span>
          </button>
          <button type="button" class="sidebar__signout-text" onclick={signOut}>
            יציאה
          </button>
        {/if}
      </div>
    {:else if sidebar.isCollapsed}
      <Tooltip.Root>
        <Tooltip.Trigger>
          {#snippet child({ props })}
            <a
              {...props}
              href="/"
              class="sidebar__ghost-btn sidebar__ghost-btn--signout"
              aria-label="כניסה לחשבון"
            >
              <span class="material-symbols-rounded" aria-hidden="true">login</span>
            </a>
          {/snippet}
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content class="hb-tooltip-content sidebar__nav-tooltip" side="left" sideOffset={8}>
            כניסה לחשבון
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    {:else}
      <a href="/" class="sidebar__signout-text sidebar__signout-text--link">כניסה</a>
    {/if}
  </footer>
</aside>
