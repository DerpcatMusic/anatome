<script lang="ts">
  import { page } from '$app/state';

  function reloadPage() {
    window.location.reload();
  }
</script>

<svelte:head>
  <title>שגיאה — AnatoMe</title>
</svelte:head>

<div class="error-page" data-theme="light">
  <div class="error-page__inner">
    <h1 class="error-page__title">משהו השתבש</h1>
    <p class="error-page__message">
      {#if page.status === 404}
        העמוד שחיפשת לא נמצא תחת אזור אישי.
      {:else if page.status}
        שגיאת שרת ({page.status})
      {:else}
        אירעה שגיאה. נסו לרענן.
      {/if}
    </p>
    <button
      type="button"
      class="hb-button hb-button--primary hb-button--md"
      onclick={reloadPage}
    >
      טעינה מחדש
    </button>
  </div>
</div>

<style>
  .error-page {
    display: grid;
    place-items: center;
    min-height: 100dvh;
    padding: 2rem;
    text-align: center;
    direction: rtl;
  }
  .error-page__inner {
    max-width: 28ch;
  }
  .error-page__title {
    font-size: 2.5rem;
    margin: 0 0 0.5rem;
  }
  .error-page__message {
    color: var(--foreground-muted);
    margin: 0 0 1.5rem;
  }
</style>
