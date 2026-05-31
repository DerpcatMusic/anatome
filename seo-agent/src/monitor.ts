/**
 * Monitor existing pages and suggest rewrites based on GSC data.
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { listPages } from "./files";

const DATA_DIR = path.resolve(import.meta.dirname, "../data/gsc");

interface GscRow {
  keys: [string, string];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

function loadLatestGsc(): GscRow[] {
  if (!fs.existsSync(DATA_DIR)) return [];
  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"));
  if (files.length === 0) return [];
  files.sort().reverse();
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, files[0]), "utf-8")) as GscRow[];
}

interface RewriteSuggestion {
  slug: string;
  keyword: string;
  action: "rewrite-title" | "expand-content" | "add-internal-links" | "merge-or-archive";
  reason: string;
  data: {
    impressions: number;
    clicks: number;
    ctr: number;
    position: number;
  };
}

export function monitorPages(): RewriteSuggestion[] {
  const pages = listPages();
  const gsc = loadLatestGsc();
  const suggestions: RewriteSuggestion[] = [];

  for (const page of pages) {
    // Find GSC rows matching this page's keyword
    const rows = gsc.filter((r) => r.keys[0].includes(page.frontmatter.targetKeyword));
    if (rows.length === 0) continue;

    const best = rows.reduce((a, b) => (a.impressions > b.impressions ? a : b));
    const { impressions, clicks, ctr, position } = best;

    if (position >= 8 && position <= 20 && impressions > 100) {
      suggestions.push({
        slug: page.slug,
        keyword: page.frontmatter.targetKeyword,
        action: "expand-content",
        reason: `Position ${position.toFixed(1)} with ${impressions} impressions. Add sections, video, FAQ to push into top 5.`,
        data: { impressions, clicks, ctr, position },
      });
    } else if (impressions > 200 && ctr < 0.02) {
      suggestions.push({
        slug: page.slug,
        keyword: page.frontmatter.targetKeyword,
        action: "rewrite-title",
        reason: `${impressions} impressions but only ${(ctr * 100).toFixed(1)}% CTR. Title/meta not compelling.`,
        data: { impressions, clicks, ctr, position },
      });
    } else if (position > 30 && impressions < 50) {
      suggestions.push({
        slug: page.slug,
        keyword: page.frontmatter.targetKeyword,
        action: "merge-or-archive",
        reason: `Stuck at position ${position.toFixed(1)} with only ${impressions} impressions. Consider merging into a stronger page.`,
        data: { impressions, clicks, ctr, position },
      });
    }
  }

  return suggestions.sort((a, b) => b.data.impressions - a.data.impressions);
}

// CLI entry
if (import.meta.main) {
  const suggestions = monitorPages();
  console.log(`🔍 ${suggestions.length} page(s) need attention:\n`);
  for (const s of suggestions) {
    console.log(`[${s.action.toUpperCase()}] /${s.slug}`);
    console.log(`   Keyword: "${s.keyword}"`);
    console.log(`   Reason: ${s.reason}`);
    console.log(`   Data: ${s.data.impressions} imp, ${s.data.clicks} clicks, pos ${s.data.position.toFixed(1)}\n`);
  }
}
