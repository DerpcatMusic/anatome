<script lang="ts">
  import { LANDING_COPY_FORMAT } from "$lib/features/landing/copy/landing-copy-manifest";

  let { data } = $props();

  let copied = $state(false);

  async function copyAll() {
    await navigator.clipboard.writeText(data.markdown);
    copied = true;
    setTimeout(() => {
      copied = false;
    }, 2000);
  }
</script>

<svelte:head>
  <title>Landing copy export — AnatoMe</title>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="copy-export">
  <header class="copy-export__header">
    <div>
      <p class="copy-export__eyebrow">{LANDING_COPY_FORMAT}</p>
      <h1>טקסטים — דף נחיתה</h1>
      <p class="copy-export__meta">
        {data.fieldCount} שדות · עודכן {new Date(data.generatedAt).toLocaleString("he-IL")}
      </p>
    </div>
    <div class="copy-export__actions">
      <button type="button" class="copy-export__btn copy-export__btn--primary" onclick={copyAll}>
        {copied ? "הועתק ✓" : "העתק הכל"}
      </button>
      <a class="copy-export__btn" href="/markdownlanding/export?download=1">הורד .md</a>
      <a
        class="copy-export__btn"
        href="/markdownlanding/export?format=json"
        target="_blank"
        rel="noreferrer"
      >
        JSON
      </a>
      <a class="copy-export__btn" href="/">← דף נחיתה</a>
    </div>
  </header>

  <aside class="copy-export__guide">
    <strong>לעבודה עם Docs</strong>
    <ol>
      <li>לחצי «העתק הכל» או הורידי את קובץ ה-markdown.</li>
      <li>ערכי רק את העברית בתוך בלוקים של <code>copy</code> — אל תשני שורות <code>@slug:</code>.</li>
      <li>שלחי את הקובץ חזרה; נזהה כל שדה לפי ה-slug (למשל <code>landing.hero.lead</code>).</li>
    </ol>
    <p>
      פורמט חלופי: <code>&lt;&lt;&lt;landing.hero.lead&gt;&gt;&gt;</code> טקסט
      <code>&lt;&lt;&lt;&gt;&gt;&gt;</code>
    </p>
  </aside>

  <pre class="copy-export__body" dir="rtl" aria-label="Landing copy markdown">{data.markdown}</pre>
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

  .copy-export__eyebrow {
    font-size: 0.75rem;
    letter-spacing: 0.04em;
    opacity: 0.65;
    margin: 0 0 0.35rem;
  }

  h1 {
    margin: 0;
    font-size: clamp(1.35rem, 3vw, 1.75rem);
  }

  .copy-export__meta {
    margin: 0.35rem 0 0;
    font-size: 0.9rem;
    opacity: 0.75;
  }

  .copy-export__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .copy-export__btn {
    display: inline-flex;
    align-items: center;
    padding: 0.45rem 0.85rem;
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
    padding: 0.85rem 1rem;
    border-radius: 12px;
    background: color-mix(in srgb, var(--hb-brand, #5c3d2e) 8%, #fff);
    font-size: 0.92rem;
    line-height: 1.5;
  }

  .copy-export__guide ol {
    margin: 0.35rem 0 0;
    padding-inline-start: 1.2rem;
  }

  .copy-export__guide code {
    font-size: 0.85em;
  }

  .copy-export__body {
    margin: 0;
    padding: 1rem 1.1rem;
    border-radius: 14px;
    background: #fff;
    border: 1px solid color-mix(in srgb, currentColor 12%, transparent);
    font-family: ui-monospace, "Cascadia Code", "Segoe UI Mono", monospace;
    font-size: 0.78rem;
    line-height: 1.55;
    white-space: pre-wrap;
    word-break: break-word;
    max-height: calc(100dvh - 14rem);
    overflow: auto;
  }
</style>
