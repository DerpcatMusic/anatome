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
  value: string;
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
  generatedAt: string;
  sections: LandingCopyExportSection[];
};

function fieldToExport(field: LandingCopyFieldDef): LandingCopyExportField {
  return {
    slug: field.slug,
    label: field.label,
    value: resolveLandingCopyValue(field.slug),
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
    generatedAt: new Date().toISOString(),
    sections: [...LANDING_COPY_SECTIONS]
      .sort((a, b) => a.order - b.order)
      .map(sectionToExport),
  };
}

function escapeFence(text: string): string {
  return text.replace(/```/g, "ˋˋˋ");
}

function formatField(field: LandingCopyExportField): string {
  const body = escapeFence(field.value);
  const emptyNote = field.value.trim() === "" ? "\n\n_(ריק באתר — אפשר למלא או להשאיר ריק)_" : "";
  return `### ${field.label}

מזהה: \`${field.slug}\`

\`\`\`text
${body}
\`\`\`${emptyNote}`;
}

/** Plain-Hebrew markdown for copywriters — send back after editing. */
export function buildLandingCopyMarkdown(doc = buildLandingCopyDocument()): string {
  const lines: string[] = [
    "# עמוד הבית — כל הטקסטים",
    "",
    "שלום! זה **כל מה שמופיע בעמוד הנחיתה** — כותרות, סיפור, שאלות, מחירים, כפתורים.",
    "",
    "## איך עורכים",
    "",
    "1. ערכי **רק** את מה שבתוך תיבות הטקסט (בין שורות עם \\`\\`\\`).",
    "2. **אל תמחקי** את שורת «מזהה: …» — היא אומרת לנו איפה להדביק בחזרה.",
    "3. אפשר לשנות ניסוח, אורך, טון — רק לא למחוק מזהים.",
    "4. כשסיימתם — שלחו את הקובץ כמו שהוא (או העתיקו הכל מ-/markdownlanding).",
    "",
    "---",
    "",
  ];

  for (const section of doc.sections) {
    lines.push(`## ${section.title}`, "");
    for (const field of section.fields) {
      lines.push(formatField(field), "");
    }
    lines.push("---", "");
  }

  lines.push(
    "_סוף הקובץ · מחירי מסלולים בפועל עשויים להתעדכן מהשרת — שמות ותיאורים כאן הם מה שרואים מבקרים בדרך כלל._",
    "",
  );

  return lines.join("\n");
}

export function buildLandingCopyJson(doc = buildLandingCopyDocument()): string {
  return JSON.stringify(doc, null, 2);
}
