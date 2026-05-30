<script lang="ts">
  import AnatoMeLogo from "$lib/components/brand/AnatoMeLogo.svelte";
  import { useI18n } from "$lib/i18n/runes";

  const { t } = useI18n();

  let {
    showLogo = true,
    title,
    subtitle,
    actions,
  }: {
    showLogo?: boolean;
    title: string;
    subtitle: string;
    actions?: import("svelte").Snippet;
  } = $props();
</script>

<div class="locked">
  {#if showLogo}
    <AnatoMeLogo class="locked__logo" size={60} aria-label={t.site.name()} role="img" />
  {/if}
  <h1>{title}</h1>
  <p>{subtitle}</p>
  {#if actions}
    <div class="locked__actions">
      {@render actions()}
    </div>
  {/if}
</div>

<style>
  .locked {
    display: grid;
    place-content: center;
    text-align: center;
    gap: var(--space-4);
    max-width: 520px;
    width: 100%;
    padding: var(--space-7) var(--space-6);
    border: var(--border);
    background: var(--elevated);
  }

  

  

  h1 {
    font-size: var(--step-3);
    line-height: 1.1;
    margin: 0;
  }

  p {
    color: var(--foreground-muted);
    max-width: 40ch;
    margin: 0;
  }

  .locked__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    justify-content: center;
    margin-top: var(--space-2);
  }


</style>
