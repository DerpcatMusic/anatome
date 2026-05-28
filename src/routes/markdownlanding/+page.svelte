<script lang="ts">
  import { LANDING_COPY_FORMAT } from "$lib/features/landing/copy/landing-copy-manifest";

  let { data } = $props();

  let copied = $state(false);

  async function copyAll() {
    await navigator.clipboard.writeText(data.markdown);
    copied = true;
    setTimeout(() => {
      copied = false;
    }, 2500);
  }
</script>

<svelte:head>
  <title>עריכת טקסטים — עמוד הבית</title>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="copy-export">
  <header class="copy-export__header">
    <div>
      <h1>כל הטקסטים של עמוד הבית</h1>
      <p class="copy-export__meta">
        {data.fieldCount} קטעי טקסט · לעריכה ב-Docs ושליחה חזרה
      </p>
    </div>
    <div class="copy-export__actions">
      <button type="button" class="copy-export__btn copy-export__btn--primary" onclick={copyAll}>
        {copied ? "הועתק ✓" : "העתיקי הכל"}
      </button>
      <a class="copy-export__btn" href="/markdownlanding/export?download=1">הורידי קובץ</a>
      <a class="copy-export__btn" href="/">← לעמוד הבית</a>
    </div>
  </header>

  <aside class="copy-export__guide">
    <p><strong>לעריכה ב-Google Docs:</strong></p>
    <ol>
      <li>לחצי «העתיקי הכל» והדביקי במסמך חדש.</li>
      <li>שני רק את העברית בתוך התיבות — לא את שורות «מזהה».</li>
      <li>שלחי את המסמך (או הקובץ) כשסיימת.</li>
    </ol>
    <p class="copy-export__guide-note">{LANDING_COPY_FORMAT}</p>
  </aside>

  <pre class="copy-export__body" dir="rtl">{data.markdown}</pre>
</div>

<style>
  .copy-export {
    min-height: 100dvh;
    padding: clamp(1.25rem, 4vw, 2.5rem);
    background: var(--hb-paper, #f6f1ea);
    color: var(--hb-ink, #1a1410);
  }

  .copy-export__header {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem 2rem;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 1.25rem;
  }

  h1 {
    margin: 0;
    font-size: clamp(1.35rem, 3vw, 1.85rem);
  }

  .copy-export__meta {
    margin: 0.35rem 0 0;
    font-size: 0.95rem;
    opacity: 0.8;
  }

  .copy-export__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .copy-export__btn {
    display: inline-flex;
    align-items: center;
    padding: 0.5rem 1rem;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
    background: #fff;
    color: inherit;
    text-decoration: none;
    font: inherit;
    cursor: pointer;
  }

  .copy-export__btn--primary {
    background: var(--hb-brand, #5c3d2e);
    color: #fff;
    border-color: transparent;
  }

  .copy-export__guide {
    margin: 0 0 1rem;
    padding: 1rem 1.15rem;
    border-radius: 14px;
    background: #fff;
    border: 1px solid color-mix(in srgb, currentColor 10%, transparent);
    font-size: 1rem;
    line-height: 1.6;
  }

  .copy-export__guide ol {
    margin: 0.5rem 0 0;
    padding-inline-start: 1.25rem;
  }

  .copy-export__guide-note {
    margin: 0.75rem 0 0;
    font-size: 0.75rem;
    opacity: 0.5;
  }

  .copy-export__body {
    margin: 0;
    padding: 1.25rem;
    border-radius: 14px;
    background: #fff;
    border: 1px solid color-mix(in srgb, currentColor 10%, transparent);
    font-family: ui-monospace, "Cascadia Code", monospace;
    font-size: 0.82rem;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
    max-height: calc(100dvh - 15rem);
    overflow: auto;
  }
</style>
