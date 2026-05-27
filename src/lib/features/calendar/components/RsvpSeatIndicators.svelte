<script lang="ts">
  let {
    capacity,
    seatsTaken,
    maxVisible = 12,
  }: {
    capacity: number;
    seatsTaken: number;
    /** Cap icons so very large classes stay readable in list cards. */
    maxVisible?: number;
  } = $props();

  const safeCapacity = $derived(Math.max(0, Math.min(capacity, maxVisible)));
  const taken = $derived(Math.max(0, Math.min(seatsTaken, safeCapacity)));
  const slots = $derived(Array.from({ length: safeCapacity }, (_, index) => index < taken));
  const overflow = $derived(capacity > maxVisible ? capacity - maxVisible : 0);
</script>

<span
  class="rsvp-seats"
  role="img"
  aria-label="{taken} מתוך {capacity} מקומות תפוסים"
  title="{taken}/{capacity}"
>
  {#each slots as filled, index (index)}
    <span
      class="material-symbols-rounded rsvp-seats__icon"
      class:icon--selected={filled}
      class:rsvp-seats__icon--taken={filled}
      aria-hidden="true"
    >person</span>
  {/each}
  {#if overflow > 0}
    <span class="rsvp-seats__overflow" aria-hidden="true">+{overflow}</span>
  {/if}
</span>

<style>
  .rsvp-seats {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 2px;
    vertical-align: middle;
  }

  .rsvp-seats__icon {
    --icon-size: 1.125rem;
    --icon-opsz: 20;
    color: color-mix(in oklch, var(--foreground-muted) 55%, transparent);
  }

  .rsvp-seats__icon--taken {
    color: var(--primary);
  }

  .rsvp-seats__overflow {
    font-family: var(--font-mono);
    font-size: var(--step--2);
    color: var(--foreground-muted);
    margin-inline-start: 2px;
  }
</style>
