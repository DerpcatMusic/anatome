<script lang="ts">
  import { browser } from "$app/environment";
  import {
    buildLandingCopyDocument,
    buildLandingCopyMarkdownFromValues,
  } from "$lib/features/landing/copy/landing-copy-export";
  import { buildLandingCopyPreviewHtml } from "$lib/features/landing/copy/landing-copy-preview";
  import {
    clearLandingCopyDraft,
    loadLandingCopyDraft,
    saveLandingCopyDraft,
  } from "$lib/features/landing/copy/landing-copy-storage";
  import { Debounced } from "runed";
  import "./LandingCopyEditor.css";

  let {
    baseline,
    fieldCount,
  }: {
    baseline: Record<string, string>;
    fieldCount: number;
  } = $props();

  let values = $state<Record<string, string>>({ ...baseline });
  let hydrated = $state(false);
  let saveStatus = $state<"idle" | "saving" | "saved">("idle");
  let lastSavedAt = $state<string | null>(null);
  let mobileTab = $state<"before" | "edit" | "after">("edit");
  let copied = $state(false);

  const debouncedValues = new Debounced(() => values, 450);

  const baselineDoc = $derived(buildLandingCopyDocument(baseline));
  const doc = $derived(buildLandingCopyDocument(values));
  const beforePreviewHtml = $derived(
    buildLandingCopyPreviewHtml(baselineDoc, { variant: "before" }),
  );
  const afterPreviewHtml = $derived(
    buildLandingCopyPreviewHtml(doc, { variant: "after" }),
  );
  const markdownExport = $derived(buildLandingCopyMarkdownFromValues(values));

  $effect(() => {
    if (!browser || hydrated) return;
    const draft = loadLandingCopyDraft();
    if (draft) {
      values = { ...baseline, ...draft.values };
      lastSavedAt = draft.savedAt;
    }
    hydrated = true;
  });

  $effect(() => {
    if (!browser || !hydrated) return;
    const snapshot = debouncedValues.current;
    if (snapshot === values && saveStatus !== "idle") return;
    saveStatus = "saving";
    saveLandingCopyDraft(snapshot);
    lastSavedAt = new Date().toISOString();
    saveStatus = "saved";
  });

  function updateField(slug: string, next: string) {
    values = { ...values, [slug]: next };
  }

  function resetToSite() {
    if (
      !confirm(
        "לאפס לטקסטים המקוריים מהאתר? השינויים השמורים בדפדפן יימחקו.",
      )
    ) {
      return;
    }
    values = { ...baseline };
    clearLandingCopyDraft();
    lastSavedAt = null;
    saveStatus = "idle";
  }

  async function copyForSend() {
    await navigator.clipboard.writeText(markdownExport);
    copied = true;
    setTimeout(() => {
      copied = false;
    }, 2500);
  }

  function downloadMarkdown() {
    const blob = new Blob([markdownExport], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `landing-copy-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function formatSavedAt(iso: string | null): string {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleString("he-IL", {
        dateStyle: "short",
        timeStyle: "short",
      });
    } catch {
      return "";
    }
  }

  function scrollPreviewsToSection(sectionId: string) {
    if (!browser) return;
    for (const pane of ["before", "after"] as const) {
      document
        .querySelector(`#preview-${pane}-${sectionId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
</script>

<div class="lcp">
  <header class="lcp__toolbar">
    <div class="lcp__toolbar-start">
      <h1 class="lcp__title">עריכת טקסטים — עמוד הבית</h1>
      <p class="lcp__meta">{fieldCount} קטעים · לפני | עריכה | אחרי</p>
      <p class="lcp__save" class:lcp__save--active={saveStatus === "saved"}>
        {#if saveStatus === "saving"}
          שומר…
        {:else if lastSavedAt}
          נשמר בדפדפן · {formatSavedAt(lastSavedAt)}
        {:else}
          נשמר אוטומטית בדפדפן
        {/if}
      </p>
    </div>

    <div class="lcp__toolbar-actions">
      <div class="lcp__mobile-tabs" role="tablist" aria-label="מצב תצוגה">
        <button
          type="button"
          role="tab"
          class="lcp__mobile-tab"
          aria-selected={mobileTab === "before"}
          onclick={() => (mobileTab = "before")}
        >
          לפני
        </button>
        <button
          type="button"
          role="tab"
          class="lcp__mobile-tab"
          aria-selected={mobileTab === "edit"}
          onclick={() => (mobileTab = "edit")}
        >
          עריכה
        </button>
        <button
          type="button"
          role="tab"
          class="lcp__mobile-tab"
          aria-selected={mobileTab === "after"}
          onclick={() => (mobileTab = "after")}
        >
          אחרי
        </button>
      </div>
      <button type="button" class="lcp__btn lcp__btn--primary" onclick={copyForSend}>
        {copied ? "הועתק ✓" : "העתיקי לשליחה"}
      </button>
      <button type="button" class="lcp__btn" onclick={downloadMarkdown}>הורידי קובץ</button>
      <button type="button" class="lcp__btn lcp__btn--ghost" onclick={resetToSite}>
        איפוס לאתר
      </button>
      <a class="lcp__btn lcp__btn--ghost" href="/">← עמוד הבית</a>
    </div>
  </header>

  <p class="lcp__hint">
    <strong>שמאל</strong> — לפני (מקור) · <strong>מרכז</strong> — עורכים כאן · <strong>ימין</strong> — אחרי (תצוגה
    חיה)
  </p>

  <!-- LTR column order: before | edit | after (physical left → right) -->
  <div class="lcp__split" dir="ltr">
    <div
      class="lcp__preview lcp__preview--before"
      class:lcp__pane--hidden={mobileTab !== "before"}
      aria-label="לפני — טקסט מקורי"
    >
      <div class="lcp__preview-chrome">
        <span class="lcp__preview-badge lcp__preview-badge--before">לפני</span>
      </div>
      <div class="lcp__preview-inner" dir="rtl">
        {@html beforePreviewHtml}
      </div>
    </div>

    <div
      class="lcp__edit"
      class:lcp__pane--hidden={mobileTab !== "edit"}
      dir="rtl"
      aria-label="עריכה"
    >
      <div class="lcp__edit-chrome">
        <span class="lcp__preview-badge lcp__preview-badge--edit">עריכה</span>
      </div>
      <nav class="lcp__section-nav" aria-label="קפיצה למדור">
        {#each doc.sections as section (section.id)}
          <a
            class="lcp__section-link"
            href="#edit-{section.id}"
            onclick={() => scrollPreviewsToSection(section.id)}
          >
            {section.title}
          </a>
        {/each}
      </nav>

      <div class="lcp__sections">
        {#each doc.sections as section (section.id)}
          <section class="lcp__section" id="edit-{section.id}">
            <h2 class="lcp__section-title">{section.title}</h2>
            {#each section.fields as field (field.slug)}
              <label class="lcp__field">
                <span class="lcp__field-label">{field.label}</span>
                <textarea
                  class="lcp__field-input"
                  rows={Math.min(8, Math.max(2, (values[field.slug] ?? "").split("\n").length + 1))}
                  value={values[field.slug] ?? ""}
                  oninput={(e) => updateField(field.slug, e.currentTarget.value)}
                ></textarea>
              </label>
            {/each}
          </section>
        {/each}
      </div>
    </div>

    <div
      class="lcp__preview lcp__preview--after"
      class:lcp__pane--hidden={mobileTab !== "after"}
      aria-label="אחרי — תצוגה מקדימה"
    >
      <div class="lcp__preview-chrome">
        <span class="lcp__preview-badge lcp__preview-badge--after">אחרי</span>
      </div>
      <div class="lcp__preview-inner" dir="rtl">
        {@html afterPreviewHtml}
      </div>
    </div>
  </div>
</div>
