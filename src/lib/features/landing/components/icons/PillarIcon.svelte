<script lang="ts">
  type Variant = "macro" | "micro" | "live";

  interface Props {
    variant: Variant;
  }

  let { variant }: Props = $props();
</script>

<svg
  class="pillar-icon"
  viewBox="0 0 24 24"
  width="1.25rem"
  height="1.25rem"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  aria-hidden="true"
>
  {#if variant === "macro"}
    <path
      d="M4 18V6l8-3 8 3v12l-8 3-8-3Z"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linejoin="round"
    />
    <path d="M12 3v18M4 6l8 3 8-3" stroke="currentColor" stroke-width="1.5" />
  {:else if variant === "micro"}
    <circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.5" />
    <path
      d="M12 8v8M8 12h8"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
  {:else}
    <circle cx="12" cy="12" r="3" fill="currentColor" />
    <path
      d="M12 3a9 9 0 0 1 9 9M12 21a9 9 0 0 1-9-9M3 12h2M19 12h2"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
  {/if}
</svg>

<style>
  .pillar-icon {
    display: block;
  }
</style>
