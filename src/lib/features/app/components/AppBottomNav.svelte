<script lang="ts">
  import { page } from "$app/state";
  import { api } from "$convex/_generated/api";
  import { canRunAuthenticatedQuery } from "$lib/auth/session.svelte";
  import { useQueryNowMs } from "$lib/convex/queryClock.svelte";
  import { useQuery } from "convex-svelte";
  import { getAppContext } from "$features/app/context/appContext";
  import {
    baseAppNavItems,
    bottomTabNavItems,
    buildLiveNavItem,
    isAppNavCurrent,
    resolveAppNavPrefix,
    type AppNavItem,
  } from "$features/app/nav/app-nav";
  import { useI18n } from "$lib/i18n/runes";
  import "./AppBottomNav.css";

  const ctx = getAppContext();
  const { t } = useI18n();
  const queryNow = useQueryNowMs();

  const prefix = $derived(resolveAppNavPrefix(page.url.pathname, ctx.role));
  const isInstructorPrefix = $derived(prefix === "/i");
  const currentPath = $derived(page.url.pathname);

  const nextLiveQuery = useQuery(api.live.next.get, () =>
    canRunAuthenticatedQuery() ? { now: queryNow.nowMs } : "skip",
  );
  const nextLive = $derived(nextLiveQuery.data ?? null);

  function buildLiveNavConfig(enterRoom: string, preConnectTitle: string) {
    return { enterRoom, preConnectTitle };
  }

  const liveNavItem = $derived.by((): AppNavItem | null => {
    if (!nextLive) return null;
    return buildLiveNavItem(nextLive, isInstructorPrefix, buildLiveNavConfig(
      t.live.preConnect.enterRoom(),
      t.live.preConnect.title(),
    ));
  });

  const tabItems = $derived(
    bottomTabNavItems(baseAppNavItems(prefix), liveNavItem),
  );
</script>

<nav class="app-bottom-nav" aria-label="ניווט ראשי">
  <ul class="app-bottom-nav__list">
    {#each tabItems as item (item.href)}
      {@const current = isAppNavCurrent(currentPath, item.href)}
      <li class="app-bottom-nav__item">
        <a
          href={item.href}
          class="app-bottom-nav__link"
          class:app-bottom-nav__link--live={item.isLive === true}
          class:app-bottom-nav__link--current={current}
          data-tone={item.tone}
          aria-current={current ? "page" : undefined}
        >
          <span
            class="material-symbols-rounded app-bottom-nav__icon"
            class:icon--selected={current}
            aria-hidden="true"
          >{item.icon}</span>
          <span class="app-bottom-nav__label">{item.tabLabel}</span>
          {#if item.isLive}
            <span class="app-bottom-nav__live-dot" aria-hidden="true"></span>
          {/if}
        </a>
      </li>
    {/each}
  </ul>
</nav>
