<script lang="ts">
  import { page } from '$app/state';
  import MarketingNavbar from '$lib/components/layout/MarketingNavbar.svelte';
  import Footer from '$lib/components/layout/Footer.svelte';
</script>

<svelte:head>
  <title>שגיאה — AnatoMe</title>
</svelte:head>

<MarketingNavbar />

<main class="error-page">
  <div class="error-page__inner">
    <h1 class="error-page__title">משהו השתבש</h1>
    <p class="error-page__message">
      {#if page.status === 404}
        העמוד לא נמצא.
      {:else}
        שגיאה ({page.status ?? 'לא ידוע'}). נסו שוב.
      {/if}
    </p>
  </div>
</main>

<Footer />

<style>
  .error-page {
    display: grid;
    place-items: center;
    min-height: 60dvh;
    padding: 2rem;
    text-align: center;
    direction: rtl;
  }
  .error-page__inner {
    max-width: 32ch;
  }
  .error-page__title {
    font-size: 2rem;
    margin: 0 0 0.5rem;
  }
  .error-page__message {
    color: var(--foreground-muted);
    margin: 0;
  }
</style>
