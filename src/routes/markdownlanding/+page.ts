import { buildLandingCopyDocument, buildLandingCopyMarkdown } from "$lib/features/landing/copy/landing-copy-export";

/** Always reflect current locale strings (not build-time snapshot). */
export const prerender = false;

export function load() {
  const doc = buildLandingCopyDocument();
  return {
    markdown: buildLandingCopyMarkdown(doc),
    doc,
    fieldCount: doc.sections.reduce((n, s) => n + s.fields.length, 0),
    generatedAt: doc.generatedAt,
  };
}
