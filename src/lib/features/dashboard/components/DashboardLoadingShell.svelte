<script lang="ts">
  import PageShell from "$features/app/components/PageShell.svelte";
  import MemberLatestVideosRail from "./MemberLatestVideosRail.svelte";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import "../dashboard.css";

  let {
    role,
  }: {
    role: "customer" | "instructor" | "admin";
  } = $props();

  const { t } = useI18n();

  const isStaff = $derived(role === "instructor" || role === "admin");
</script>

<PageShell title={isStaff ? t.dashboard.titleStaff() : t.dashboard.title()}>
  <div class="dashboard-shell" aria-busy="true" aria-label={t.app.loading()}>
    <div class="dashboard-skeleton dashboard-panel">
      <div class="dashboard-skeleton__bar dashboard-skeleton__bar--lg"></div>
      <div class="dashboard-skeleton__bar"></div>
      <div class="dashboard-skeleton__bar"></div>
    </div>

    {#if !isStaff}
      <div class="dashboard-shell--member">
        <div class="dashboard-home__grid dashboard-home__grid--member">
          <div class="dashboard-skeleton dashboard-panel">
            <div class="dashboard-skeleton__bar dashboard-skeleton__bar--lg"></div>
            <div class="dashboard-skeleton__bar"></div>
          </div>
          <aside class="dashboard-shell__aside">
            <div class="dashboard-skeleton dashboard-panel">
              <div class="dashboard-skeleton__bar"></div>
              <div class="dashboard-skeleton__bar"></div>
            </div>
          </aside>
        </div>
        <MemberLatestVideosRail />
      </div>
    {:else}
      <div class="dashboard-skeleton dashboard-panel">
        <div class="dashboard-skeleton__bar dashboard-skeleton__bar--lg"></div>
        <div class="dashboard-skeleton__bar"></div>
      </div>
    {/if}
  </div>
</PageShell>

<style>
  .dashboard-shell {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    min-width: 0;
  }

  .dashboard-shell__aside {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    min-width: 0;
  }

  .dashboard-shell--member {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    min-width: 0;
  }
</style>
