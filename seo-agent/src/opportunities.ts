/**
 * Analyze GSC data and find opportunities.
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { listPages } from "./files";

const DATA_DIR = path.resolve(import.meta.dirname, "../data/gsc");

interface GscRow {
  keys: [string, string]; // [query, page]
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface Opportunity {
  keyword: string;
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  action: "create" | "rewrite" | "improve-meta" | "ignore";
  score: number;
  reason: string;
}

function loadLatestGsc(): GscRow[] {
  if (!fs.existsSync(DATA_DIR)) return [];
  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"));
  if (files.length === 0) return [];
  files.sort().reverse();
  const latest = path.join(DATA_DIR, files[0]);
  return JSON.parse(fs.readFileSync(latest, "utf-8")) as GscRow[];
}

function scoreOpportunity(row: GscRow, existingSlugs: Set<string>): Opportunity {
  const [keyword, page] = row.keys;
  const pos = row.position;
  const imp = row.impressions;
  const clicks = row.clicks;
  const ctr = row.ctr;

  // Check if we already have a page for this keyword
  const slug = keyword.replace(/\s+/g, "-");
  const hasPage = existingSlugs.has(slug);

  // Scoring logic
  let action: Opportunity["action"] = "ignore";
  let score = 0;
  let reason = "";

  if (!hasPage && imp > 50 && keyword.includes("פילאטיס")) {
    action = "create";
    score = Math.round(imp / 10 + (30 - pos));
    reason = `No page for "${keyword}" but ${imp} impressions. Position ${pos.toFixed(1)}.`;
  } else if (hasPage && pos >= 8 && pos <= 30 && imp > 100) {
    action = "rewrite";
    score = Math.round(imp / 5 + (30 - pos) * 2);
    reason = `Page exists for "${keyword}" but stuck at position ${pos.toFixed(1)} with ${imp} impressions.`;
  } else if (hasPage && imp > 200 && ctr < 0.02) {
    action = "improve-meta";
    score = Math.round(imp / 3);
    reason = `High impressions (${imp}) but terrible CTR (${(ctr * 100).toFixed(1)}%). Rewrite title/meta.`;
  }

  return {
    keyword,
    page,
    clicks,
    impressions: imp,
    ctr,
    position: pos,
    action,
    score,
    reason,
  };
}

export function findOpportunities(): Opportunity[] {
  const rows = loadLatestGsc();
  const pages = listPages();
  const existingSlugs = new Set(pages.map((p) => p.slug));

  console.log(`📁 Existing pages: ${existingSlugs.size}`);
  console.log(`📊 GSC rows: ${rows.length}`);

  const ops = rows
    .map((row) => scoreOpportunity(row, existingSlugs))
    .filter((o) => o.action !== "ignore")
    .sort((a, b) => b.score - a.score);

  return ops;
}

// CLI entry
if (import.meta.main) {
  const ops = findOpportunities();
  console.log(`\n🔍 Top ${Math.min(20, ops.length)} opportunities:\n`);
  for (const op of ops.slice(0, 20)) {
    console.log(`[${op.action.toUpperCase()}] score=${op.score} | ${op.keyword}`);
    console.log(`   ${op.reason}`);
  }

  // Save to file
  const outPath = path.resolve(import.meta.dirname, "../data/opportunities.json");
  fs.writeFileSync(outPath, JSON.stringify(ops, null, 2), "utf-8");
  console.log(`\n💾 Saved to ${outPath}`);
}
