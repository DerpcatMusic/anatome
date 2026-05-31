<script>
  import { page } from '$app/state';
  import { Button } from 'bits-ui';

  function reloadPage() {
    window.location.reload();
  }
</script>

<svelte:head>
  <title>שגיאה — AnatoMe</title>
</svelte:head>

<main class="error-page">
  <div class="error-page__inner">
    <h1 class="error-page__title">משהו השתבש</h1>
    <p class="error-page__message">
      {#if page.status === 404}
        העמוד שחיפשת לא נמצא.
      {:else if page.status}
        שגיאת שרת ({page.status})
      {:else}
        אירעה שגיאה בלתי צפויה. אפשר לנסות שוב.
      {/if}
    </p>
    <Button.Root class="hb-button hb-button--primary" type="button" onclick={reloadPage}>
      טעינה מחדש
    </Button.Root>
  </div>
</main>

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
    max-width: 32ch;
  }
  .error-page__title {
    font-size: 3rem;
    margin: 0 0 0.5rem;
  }
  .error-page__message {
    color: var(--foreground-muted);
    margin: 0 0 1.5rem;
  }
</style>
