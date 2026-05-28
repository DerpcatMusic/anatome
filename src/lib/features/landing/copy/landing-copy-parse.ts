/**
 * Parse edited landing copy exports back into slug → value map.
 */

const SLUG_FENCE_RE =
  /@slug:\s*([a-zA-Z0-9_.-]+)\s*\n```(?:copy)?\s*\n([\s\S]*?)\n```/g;

const BRACKET_OPEN_RE = /<<<([a-zA-Z0-9_.-]+)>>>\s*\n?/g;
const BRACKET_CLOSE = "<<<>>>";

export type ParsedLandingCopy = {
  format: string | null;
  entries: Map<string, string>;
  warnings: string[];
};

function normalizeValue(raw: string): string {
  return raw.replace(/\\`\\`\\`/g, "```").replace(/\r\n/g, "\n").trimEnd();
}

function parseFrontmatterFormat(markdown: string): string | null {
  const match = markdown.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return null;
  const formatLine = match[1].match(/^format:\s*(.+)$/m);
  return formatLine?.[1]?.trim() ?? null;
}

/** Parse `@slug` + fenced blocks (primary) and `<<<slug>>>` blocks (alternate). */
export function parseLandingCopyMarkdown(markdown: string): ParsedLandingCopy {
  const entries = new Map<string, string>();
  const warnings: string[] = [];

  for (const match of markdown.matchAll(SLUG_FENCE_RE)) {
    const slug = match[1];
    const value = normalizeValue(match[2]);
    if (entries.has(slug)) {
      warnings.push(`Duplicate slug "${slug}" — using last occurrence`);
    }
    entries.set(slug, value);
  }

  const bracketParts = markdown.split(BRACKET_OPEN_RE);
  if (bracketParts.length > 1) {
    for (let i = 1; i < bracketParts.length; i += 2) {
      const slug = bracketParts[i];
      const rest = bracketParts[i + 1] ?? "";
      const closeIdx = rest.indexOf(BRACKET_CLOSE);
      if (closeIdx === -1) {
        warnings.push(`Missing ${BRACKET_CLOSE} after slug "${slug}"`);
        continue;
      }
      const value = normalizeValue(rest.slice(0, closeIdx));
      if (entries.has(slug)) {
        warnings.push(`Duplicate slug "${slug}" (bracket) — using bracket value`);
      }
      entries.set(slug, value);
    }
  }

  return {
    format: parseFrontmatterFormat(markdown),
    entries,
    warnings,
  };
}
