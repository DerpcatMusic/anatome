<script lang="ts">
  import { page } from "$app/state";
  import { api } from "$convex/_generated/api";
  import { initAuth, signOut, canRunAuthenticatedQuery } from "$lib/auth/session.svelte";
  import { useQueryNowMs } from "$lib/convex/queryClock.svelte";
  import { useQuery } from "convex-svelte";
  import PlanBadge from "$lib/features/subscriptions/components/PlanBadge.svelte";
  import { getAppContext } from "$features/app/context/appContext";
  import { appMobileMenu } from "$features/app/app-mobile-menu.svelte";
  import { resolveAppNavPrefix } from "$features/app/nav/app-nav";
  import { theme } from "$features/app/theme.svelte";
  import AnatoMeLogo from "$lib/components/brand/AnatoMeLogo.svelte";
  import WalletCreditStrip from "$lib/features/credits/WalletCreditStrip.svelte";
  import { walletBalances } from "$lib/features/credits/balances";
  import { poolsForSidebar } from "$lib/features/credits/pools-for-context";
  import HbBottomSheet from "$lib/components/ui/HbBottomSheet.svelte";
  import "./AppMobileMenuSheet.css";

  const auth = initAuth();
  const ctx = getAppContext();

  const prefix = $derived(resolveAppNavPrefix(page.url.pathname, ctx.role));
  const isInstructorPrefix = $derived(prefix === "/i");
  const profile = $derived(ctx.viewer);
  const settingsHref = $derived(isInstructorPrefix ? "/i/dashboard?panel=account" : "/u/dashboard?panel=account");

  const queryNow = useQueryNowMs();
  const subscriptionQuery = useQuery(api.subscriptions.customer.getMine, () =>
    canRunAuthenticatedQuery() && !isInstructorPrefix ? { now: queryNow.nowMs } : "skip",
  );
  const currentPlan = $derived(subscriptionQuery.data?.plan ?? null);
  const creditBalances = $derived(walletBalances(subscriptionQuery.data?.wallet ?? null));
  const showCredits = $derived(auth.isAuthenticated && !isInstructorPrefix);

  const userLabel = $derived.by(() => {
    if (!auth.isAuthenticated) return null;
    const name = profile?.displayName?.trim();
    if (name) return name;
    const email = profile?.email?.trim();
    if (email) return email;
    return "מחוברת";
  });

  const themeLabel = $derived(theme.isDark ? "מעבר למצב בהיר" : "מעבר למצב כהה");

  function close() {
    appMobileMenu.closeMenu();
  }
  function toggleTheme() {
    theme.toggle();
  }
</script>

<HbBottomSheet
  bind:open={appMobileMenu.open}
  ariaLabel="תפריט חשבון"
  initialSnap="half"
  showHandle={true}
  onClose={close}
>
  {#snippet headerActions()}
    <a class="app-mobile-menu__brand" href="/" onclick={close}>
      <AnatoMeLogo size={36} />
      <span class="app-mobile-menu__area">{isInstructorPrefix ? "סטודיו" : "אישי"}</span>
    </a>
  {/snippet}

  <div class="app-mobile-menu__content">
    {#if auth.isAuthenticated}
      <div class="app-mobile-menu__user">
        {#if profile?.avatarUrl}
          <img class="app-mobile-menu__avatar" src={profile.avatarUrl} alt="" width="44" height="44" />
        {:else}
          <span class="app-mobile-menu__avatar app-mobile-menu__avatar--placeholder" aria-hidden="true">
            {userLabel?.slice(0, 1) ?? "?"}
          </span>
        {/if}
        <div class="app-mobile-menu__user-meta">
          <span class="app-mobile-menu__user-label">{userLabel}</span>
          {#if currentPlan}
            <PlanBadge planName={currentPlan.nameHe} planSlug={currentPlan.slug} size="sm" />
          {/if}
          {#if isInstructorPrefix && ctx.role}
            <span class="app-mobile-menu__role role-badge role-badge--{ctx.role}">
              {ctx.role === "admin" ? "Admin" : "Instructor"}
            </span>
          {/if}
        </div>
      </div>

      {#if showCredits}
        <div class="app-mobile-menu__credits">
          <WalletCreditStrip
            balances={creditBalances}
            pools={poolsForSidebar()}
            size="sm"
            layout="stack"
            amountFirst
          />
        </div>
      {/if}

      <nav class="app-mobile-menu__actions" aria-label="הגדרות חשבון">
        <a class="app-mobile-menu__action" href={settingsHref} onclick={close}>
          <span class="material-symbols-rounded" aria-hidden="true">person</span>
          פרופיל והגדרות
        </a>
        <button type="button" class="app-mobile-menu__action" onclick={toggleTheme}>
          <span class="material-symbols-rounded" aria-hidden="true">
            {theme.isDark ? "light_mode" : "dark_mode"}
          </span>
          {themeLabel}
        </button>
        <button type="button" class="app-mobile-menu__action app-mobile-menu__action--danger" onclick={signOut}>
          <span class="material-symbols-rounded" aria-hidden="true">logout</span>
          יציאה מהחשבון
        </button>
      </nav>
    {:else}
      <nav class="app-mobile-menu__actions">
        <a class="app-mobile-menu__action" href="/" onclick={close}>
          <span class="material-symbols-rounded" aria-hidden="true">login</span>
          כניסה לחשבון
        </a>
      </nav>
    {/if}
  </div>
</HbBottomSheet>
