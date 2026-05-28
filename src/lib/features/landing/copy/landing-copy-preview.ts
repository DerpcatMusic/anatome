import type { LandingCopyExportDocument } from "./landing-copy-export";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function nl2br(text: string): string {
  return escapeHtml(text).replace(/\n/g, "<br />");
}

export type LandingCopyPreviewOptions = {
  variant?: "before" | "after";
  panelTitle?: string;
  panelNote?: string;
};

/** Readable preview HTML — headings from structure, body is plain text only. */
export function buildLandingCopyPreviewHtml(
  doc: LandingCopyExportDocument,
  options: LandingCopyPreviewOptions = {},
): string {
  const variant = options.variant ?? "after";
  const panelTitle =
    options.panelTitle ??
    (variant === "before" ? "לפני — כמו באתר עכשיו" : "אחרי — הגרסה שלך");
  const panelNote =
    options.panelNote ??
    (variant === "before"
      ? "הטקסט המקורי. לא ניתן לערוך כאן."
      : "מתעדכן בזמן אמת לפי מה שכתבת במרכז.");

  const parts: string[] = [
    `<article class="lcp-preview__article lcp-preview__article--${variant}">`,
    `<header class="lcp-preview__intro">`,
    `<h1 class="lcp-preview__page-title">${escapeHtml(panelTitle)}</h1>`,
    `<p class="lcp-preview__note">${escapeHtml(panelNote)}</p>`,
    `</header>`,
  ];

  for (const section of doc.sections) {
    parts.push(
      `<section class="lcp-preview__section" id="preview-${variant}-${section.id}">`,
    );
    parts.push(`<h2 class="lcp-preview__section-title">${escapeHtml(section.title)}</h2>`);

    for (const field of section.fields) {
      parts.push(`<div class="lcp-preview__field">`);
      parts.push(`<h3 class="lcp-preview__field-label">${escapeHtml(field.label)}</h3>`);
      if (field.value.trim()) {
        parts.push(`<p class="lcp-preview__field-body">${nl2br(field.value)}</p>`);
      } else {
        parts.push(`<p class="lcp-preview__field-body lcp-preview__field-body--empty">(ריק)</p>`);
      }
      parts.push(`</div>`);
    }

    parts.push(`</section>`);
  }

  parts.push(`</article>`);
  return parts.join("");
}
