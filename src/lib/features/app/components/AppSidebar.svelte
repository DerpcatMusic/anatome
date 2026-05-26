<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { api } from "$convex/_generated/api";
  import { initAuth, signOut, canRunAuthenticatedQuery } from "$lib/auth/session.svelte";
  import { useQuery } from "convex-svelte";
  import PlanBadge from "$lib/features/subscriptions/components/PlanBadge.svelte";
  import { getAppContext } from "$features/app/context/appContext";
  import { liveRoomHref } from "$lib/i18n/context";
  import { theme } from "$features/app/theme.svelte";
  import { useI18n } from "$lib/i18n/runes";
  import WalletCreditStrip from "$lib/features/credits/WalletCreditStrip.svelte";
  import { walletBalances } from "$lib/features/credits/balances";
  import { poolsForSidebar } from "$lib/features/credits/pools-for-context";
  import "./AppSidebar.css";

  const auth = initAuth();
  const ctx = getAppContext();
  const { t } = useI18n();

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
      { href: "/u/calendar", label: "לייבים" },
      { href: "/u/library", label: "וידאו" },
      { href: "/u/profile", label: "פרופיל" },
    ],
    "/i": [
      { href: "/i/dashboard", label: "סקירה" },
      { href: "/i/live", label: "סטודיו" },
      { href: "/i/videos", label: "וידאו" },
      { href: "/i/profile", label: "פרופיל" },
    ],
  };

  const profile = $derived(ctx.viewer);

  let subscriptionReady = $state(false);
  onMount(() => {
    const enable = () => {
      subscriptionReady = true;
    };
    if (typeof requestIdleCallback === "function") {
      const id = requestIdleCallback(enable, { timeout: 400 });
      return () => cancelIdleCallback(id);
    }
    const id = requestAnimationFrame(enable);
    return () => cancelAnimationFrame(id);
  });

  const subscriptionQuery = useQuery(api.subscriptions.customer.getMine, () =>
    canRunAuthenticatedQuery() && subscriptionReady && !isInstructorPrefix ? {} : "skip",
  );
  const currentPlan = $derived(subscriptionQuery.data?.plan ?? null);
  const creditBalances = $derived(walletBalances(subscriptionQuery.data?.wallet ?? null));
  const showCreditStrip = $derived(auth.isAuthenticated && !isInstructorPrefix);
  const userLabel = $derived.by(() => {
    if (!auth.isAuthenticated) return null;
    const name = profile?.displayName?.trim();
    if (name) return name;
    const email = profile?.email?.trim();
    if (email) return email;
    return "מחוברת";
  });

  const nextLiveQuery = useQuery(api.live.next.get, () => canRunAuthenticatedQuery() ? {} : "skip");
  const nextLive = $derived(nextLiveQuery.data ?? null);
  /** Server filters eligibility (RSVP + equipment + join window). */
  const showLiveTab = $derived(nextLive !== null);

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
  <header class="sidebar__brand">
    <a class="sidebar__home" href="/" aria-label="{t.site.name()} — {t.site.tagline()}">
      <span class="sidebar__logo">{t.site.name()}</span>
    </a>
    <div class="sidebar__area">
      <span class="sidebar__area-label">{isInstructorPrefix ? "סטודיו" : "אישי"}</span>
      {#if isInstructorPrefix && ctx.role}
        <span class="role-badge role-badge--{ctx.role}">{ctx.role === "admin" ? "Admin" : "Instructor"}</span>
      {/if}
    </div>
  </header>

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
        <div class="sidebar__user-meta">
          <span class="sidebar__user-label">{userLabel}</span>
          {#if currentPlan}
            <PlanBadge planName={currentPlan.nameHe} planSlug={currentPlan.slug} size="sm" />
          {/if}
        </div>
      </div>
      <div class="sidebar__footer-actions">
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
      <a href="/" class="sidebar__signout sidebar__signout--link">כניסה</a>
    {/if}
  </footer>
</aside>
