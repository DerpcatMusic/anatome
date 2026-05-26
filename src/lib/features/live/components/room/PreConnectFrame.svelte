<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    title,
    backHref,
    children,
  }: {
    title: string;
    backHref: string;
    children: Snippet;
  } = $props();
</script>

<section class="live-entry" aria-label={title}>
  <div class="live-entry__mesh" aria-hidden="true"></div>
  <div class="live-entry__shell">
    <header class="live-entry__header">
      <a class="live-entry__close" href={backHref} aria-label="חזרה">
        <span class="material-symbols-rounded" aria-hidden="true">close</span>
      </a>
      <h1 class="live-entry__title">{title}</h1>
    </header>
    {@render children()}
  </div>
</section>

<style>
  @import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,500,0,0");

  .live-entry {
    position: fixed;
    inset: 0;
    z-index: 60;
    display: grid;
    place-items: center;
    overflow: auto;
    padding: clamp(16px, 3vw, 40px);
    box-sizing: border-box;
    background: var(--paper);
  }

  .live-entry__mesh {
    display: none;
  }

  .live-entry__shell {
    position: relative;
    width: min(100%, 1120px);
    min-height: min(720px, calc(100vh - 48px));
    display: grid;
    grid-template-rows: auto 1fr;
    gap: clamp(20px, 3vw, 36px);
    padding: clamp(18px, 3vw, 36px);
    border: 1px solid var(--line-light);
    background: var(--elevated);
    box-shadow: 0 8px 32px rgb(0 0 0 / 0.08);
  }

  .live-entry__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    direction: rtl;
  }

  .live-entry__close {
    display: inline-grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border: var(--border);
    background: var(--elevated);
    color: var(--muted);
    text-decoration: none;
    border-radius: 0;
    transition:
      background var(--duration-fast),
      color var(--duration-fast),
      border-radius 0.55s cubic-bezier(0.34, 1.8, 0.64, 1);
    flex-shrink: 0;
  }

  .live-entry__close:hover {
    background: var(--surface);
    color: var(--ink);
    border-radius: 18px;
  }

  .live-entry__title {
    font-size: clamp(1.6rem, 3vw, 2.4rem);
    line-height: 1.1;
    font-weight: 900;
    margin: 0;
    flex: 1;
    text-align: center;
  }

  .material-symbols-rounded {
    width: 1.5rem;
    height: 1.5rem;
    display: block;
    overflow: hidden;
    font-family: "Material Symbols Rounded";
    font-size: 1.5rem;
    line-height: 1;
    letter-spacing: 0;
    direction: ltr;
    font-feature-settings: "liga";
  }

  @media (max-width: 52rem) {
    .live-entry {
      place-items: stretch;
      padding: var(--space-3);
    }

    .live-entry__shell {
      min-height: calc(100vh - 24px);
      gap: var(--space-5);
    }

    .live-entry__title {
      font-size: var(--step-2);
    }
  }
</style>
