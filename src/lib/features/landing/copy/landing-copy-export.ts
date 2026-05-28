import {
  LANDING_COPY_FORMAT,
  LANDING_COPY_SECTIONS,
  type LandingCopyFieldDef,
  type LandingCopySectionDef,
} from "./landing-copy-manifest";
import { resolveLandingCopyValue } from "./landing-copy-resolve";

export type LandingCopyExportField = {
  slug: string;
  label: string;
  hint?: string;
  value: string;
  empty: boolean;
};

export type LandingCopyExportSection = {
  id: string;
  title: string;
  order: number;
  fields: LandingCopyExportField[];
};

export type LandingCopyExportDocument = {
  format: typeof LANDING_COPY_FORMAT;
  locale: "he";
  source: "marketing landing page";
  generatedAt: string;
  sections: LandingCopyExportSection[];
};

function fieldToExport(field: LandingCopyFieldDef): LandingCopyExportField {
  const value = resolveLandingCopyValue(field.slug);
  return {
    slug: field.slug,
    label: field.label,
    hint: field.hint,
    value,
    empty: value.trim().length === 0,
  };
}

function sectionToExport(section: LandingCopySectionDef): LandingCopyExportSection {
  return {
    id: section.id,
    title: section.title,
    order: section.order,
    fields: section.fields.map(fieldToExport),
  };
}

export function buildLandingCopyDocument(): LandingCopyExportDocument {
  return {
    format: LANDING_COPY_FORMAT,
    locale: "he",
    source: "marketing landing page",
    generatedAt: new Date().toISOString(),
    sections: [...LANDING_COPY_SECTIONS]
      .sort((a, b) => a.order - b.order)
      .map(sectionToExport),
  };
}

function escapeFence(text: string): string {
  return text.replace(/```/g, "\\`\\`\\`");
}

function formatFieldBlock(field: LandingCopyExportField): string {
  const meta: string[] = [`@slug: ${field.slug}`, `@label: ${field.label}`];
  if (field.hint) meta.push(`@hint: ${field.hint}`);
  if (field.empty) meta.push("@empty: true");

  const body = escapeFence(field.value);
  return `${meta.join("\n")}\n\`\`\`copy\n${body}\n\`\`\``;
}

/**
 * Markdown export for copy/paste into Google Docs.
 * Edit only text inside ```copy fences; keep @slug lines unchanged.
 */
export function buildLandingCopyMarkdown(doc = buildLandingCopyDocument()): string {
  const lines: string[] = [
    "---",
    `format: ${doc.format}`,
    `locale: ${doc.locale}`,
    `source: ${doc.source}`,
    `generatedAt: ${doc.generatedAt}`,
    "---",
    "",
    "# AnatoMe — Landing page copy",
    "",
    "> **How to use:** Copy this file to your doc. Change only the Hebrew inside each `copy` code block.",
    "> Keep every `@slug:` line exactly as-is — that is how we map your edits back to the site.",
    "",
    "| Marker | Meaning |",
    "|--------|---------|",
    "| `@slug` | Stable key (do not edit) |",
    "| `@label` | What this field is on the page |",
    "| `@hint` | Extra context |",
    "| `@empty: true` | Currently blank on the site |",
    "",
    "---",
    "",
  ];

  for (const section of doc.sections) {
    lines.push(`## ${section.title} {#${section.id}}`, "");
    for (const field of section.fields) {
      lines.push(formatFieldBlock(field), "");
    }
  }

  lines.push(
    "---",
    "",
    "## Import back",
    "",
    "Send this file (or a edited copy) to the agent. We parse `@slug` + ```copy``` blocks.",
    "Alternate delimiters also supported: `<<<landing.hero.lead>>>` … `<<<>>>`",
    "",
  );

  return lines.join("\n");
}

export function buildLandingCopyJson(doc = buildLandingCopyDocument()): string {
  return JSON.stringify(doc, null, 2);
}
