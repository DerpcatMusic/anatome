/**
 * Parse edited landing copy back into slug → value map.
 */

const SLUG_FENCE_RE =
  /מזהה:\s*`?([a-zA-Z0-9_.-]+)`?\s*\n+```(?:copy|text)?\s*\n([\s\S]*?)\n```/g;

/** Legacy v1 format */
const LEGACY_SLUG_FENCE_RE =
  /@slug:\s*([a-zA-Z0-9_.-]+)\s*\n```(?:copy)?\s*\n([\s\S]*?)\n```/g;

const BRACKET_OPEN_RE = /<<<([a-zA-Z0-9_.-]+)>>>\s*\n?/g;
const BRACKET_CLOSE = "<<<>>>";

export type ParsedLandingCopy = {
  format: string | null;
  entries: Map<string, string>;
  warnings: string[];
};

function normalizeValue(raw: string): string {
  return raw
    .replace(/\\`\\`\\`/g, "```")
    .replace(/\r\n/g, "\n")
    .replace(/^\n+|\n+$/g, "")
    .replace(/\n\n_\(ריק באתר[\s\S]*?\)_\s*$/u, "")
    .trimEnd();
}

function parseFrontmatterFormat(markdown: string): string | null {
  const match = markdown.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return null;
  const formatLine = match[1].match(/^format:\s*(.+)$/m);
  return formatLine?.[1]?.trim() ?? null;
}

function collectMatches(
  markdown: string,
  re: RegExp,
  entries: Map<string, string>,
  warnings: string[],
  source: string,
): void {
  for (const match of markdown.matchAll(re)) {
    const slug = match[1];
    const value = normalizeValue(match[2]);
    if (entries.has(slug)) {
      warnings.push(`Duplicate slug "${slug}" (${source}) — using last`);
    }
    entries.set(slug, value);
  }
}

export function parseLandingCopyMarkdown(markdown: string): ParsedLandingCopy {
  const entries = new Map<string, string>();
  const warnings: string[] = [];

  collectMatches(markdown, SLUG_FENCE_RE, entries, warnings, "v2");
  collectMatches(markdown, LEGACY_SLUG_FENCE_RE, entries, warnings, "v1");

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
      entries.set(slug, value);
    }
  }

  return {
    format: parseFrontmatterFormat(markdown),
    entries,
    warnings,
  };
}
