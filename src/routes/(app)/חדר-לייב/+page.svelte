<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { api } from "$convex/_generated/api";
  import { useQuery } from "convex-svelte";
  import {
    canRunAuthenticatedQuery,
    getCachedRole,
  } from "$lib/auth/session.svelte";
  import { liveRoomHref, routePath } from "$lib/i18n/context";
  import { isInvalidLiveClassIdParam } from "$lib/convex/ids";
  import PreConnectState from "$features/live/components/room/PreConnectState.svelte";
  import { useI18n } from "$lib/i18n/runes.svelte";

  const { t } = useI18n();

  const classIdParam = $derived(page.url.searchParams.get("classId"));
  const invalidClassId = $derived(isInvalidLiveClassIdParam(classIdParam));
  const calendarHref = routePath("uCalendar");
  /** Strangler: `?roomEngine=v2` uses core-only rebuild (`src/lib/features/live/v2/`). */
  const useRoomEngineV2 = $derived(page.url.searchParams.get("roomEngine") === "v2");

  const isStaffWithoutClass = $derived.by(() => {
    if (invalidClassId) return false;
    if (classIdParam !== null) return false;
    const role = getCachedRole();
    return role === "instructor" || role === "admin";
  });

  const staffRedirectNow = Date.now();
  const nextLiveQuery = useQuery(api.live.next.get, () =>
    isStaffWithoutClass && canRunAuthenticatedQuery()
      ? { now: staffRedirectNow }
      : "skip",
  );

  const entryPhase = $derived.by(() => {
    if (invalidClassId) return "invalidClass" as const;
    if (classIdParam !== null) return "room" as const;
    if (!isStaffWithoutClass) return "room" as const;
    if (!canRunAuthenticatedQuery() || nextLiveQuery.isLoading) return "resolving" as const;
    const nextClassId = nextLiveQuery.data?.classId;
    if (nextClassId) return "redirect" as const;
    return "room" as const;
  });

  $effect(() => {
    if (entryPhase !== "redirect") return;
    const nextClassId = nextLiveQuery.data?.classId;
    if (!nextClassId) return;
    void goto(liveRoomHref(nextClassId), { replaceState: true });
  });
</script>

{#if entryPhase === "resolving"}
  <section class="live-entry-resolve" aria-busy="true" aria-label={t.live.preConnect.title()}>
    <PreConnectState loading message={t.live.preConnect.checking()} />
  </section>
{:else if entryPhase === "invalidClass"}
  <section class="live-entry-resolve" aria-label={t.live.preConnect.invalidClassTitle()}>
    <PreConnectState
      title={t.live.preConnect.invalidClassTitle()}
      message={t.live.preConnect.invalidClassBody()}
      actionLabel={t.live.preConnect.missingCta()}
      actionHref={calendarHref}
    />
  </section>
{:else if useRoomEngineV2}
  {#await import("$lib/features/live/v2/LiveRoomV2Shell.svelte") then { default: LiveRoomV2Shell }}
    <LiveRoomV2Shell />
  {/await}
{:else}
  {#await import("$lib/features/live/components/room/LiveRoomShell.svelte") then { default: LiveRoomShell }}
    <LiveRoomShell />
  {/await}
{/if}

<style>
  .live-entry-resolve {
    position: relative;
    flex: 1 1 auto;
    min-height: 0;
    height: 100%;
    display: grid;
    place-items: center;
    padding: var(--space-4);
    box-sizing: border-box;
  }
</style>
