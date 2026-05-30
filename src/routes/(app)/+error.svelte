<script lang="ts">
  import { page } from '$app/state';
</script>

<svelte:head>
  <title>שגיאה — AnatoMe</title>
</svelte:head>

<div
  style="display:grid;place-items:center;min-height:100dvh;padding:2rem;text-align:center;direction:rtl"
  data-theme="light"
>
  <div style="max-width:28ch">
    <h1 style="font-size:2.5rem;margin:0 0 0.5rem">משהו השתבש</h1>
    <p style="color:var(--foreground-muted);margin:0 0 1.5rem">
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
      onclick={() => window.location.reload()}
    >
      טעינה מחדש
    </button>
  </div>
</div>
