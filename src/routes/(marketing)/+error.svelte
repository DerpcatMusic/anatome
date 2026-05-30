<script lang="ts">
  import { page } from '$app/state';
  import MarketingNavbar from '$lib/components/layout/MarketingNavbar.svelte';
  import Footer from '$lib/components/layout/Footer.svelte';
</script>

<svelte:head>
  <title>שגיאה — AnatoMe</title>
</svelte:head>

<MarketingNavbar />

<main style="display:grid;place-items:center;min-height:60dvh;padding:2rem;text-align:center;direction:rtl">
  <div style="max-width:32ch">
    <h1 style="font-size:2rem;margin:0 0 0.5rem">משהו השתבש</h1>
    <p style="color:var(--foreground-muted);margin:0">
      {#if page.status === 404}
        העמוד לא נמצא.
      {:else}
        שגיאה ({page.status ?? 'לא ידוע'}). נסו שוב.
      {/if}
    </p>
  </div>
</main>

<Footer />
