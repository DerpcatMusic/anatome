<script>
  import { page } from '$app/state';
  import { Button } from 'bits-ui';
</script>

<svelte:head>
  <title>שגיאה — AnatoMe</title>
</svelte:head>

<main style="display:grid;place-items:center;min-height:100dvh;padding:2rem;text-align:center;direction:rtl">
  <div style="max-width:32ch">
    <h1 style="font-size:3rem;margin:0 0 0.5rem">משהו השתבש</h1>
    <p style="color:var(--foreground-muted);margin:0 0 1.5rem">
      {#if page.status === 404}
        העמוד שחיפשת לא נמצא.
      {:else if page.status}
        שגיאת שרת ({page.status})
      {:else}
        אירעה שגיאה בלתי צפויה. אפשר לנסות שוב.
      {/if}
    </p>
    <Button.Root class="hb-button hb-button--primary" type="button" onclick={() => window.location.reload()}>
      טעינה מחדש
    </Button.Root>
  </div>
</main>
