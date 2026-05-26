<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { resolveDashboardRedirectPath } from "$lib/auth/resolve-dashboard-redirect";
  import { useI18n } from "$lib/i18n/runes.svelte";

  const { t } = useI18n();

  onMount(() => {
    void (async () => {
      const target = await resolveDashboardRedirectPath();
      await goto(target, { replaceState: true });
    })();
  });
</script>

<div class="dashboard-redirect">
  <p>{t.app.loading()}</p>
</div>

<style>
  .dashboard-redirect {
    min-height: 40vh;
    display: grid;
    place-items: center;
    padding: var(--space-6);
  }
</style>
