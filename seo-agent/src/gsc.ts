/**
 * Pull Google Search Console data for anatome.co.il
 *
 * Setup:
 * 1. Go to https://console.cloud.google.com/apis/credentials
 * 2. Create a Service Account, download JSON key
 * 3. Enable "Google Search Console API"
 * 4. Add the service account email as an "Owner" in Search Console settings for anatome.co.il
 * 5. Save the JSON key path to .env as GSC_KEY_FILE
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { google } from "googleapis";

const SITE_URL = process.env.GSC_SITE_URL ?? "https://www.anatome.co.il/";
const KEY_FILE = process.env.GSC_KEY_FILE ?? "";
const DATA_DIR = path.resolve(import.meta.dirname, "../data/gsc");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

async function getAuth() {
  if (!KEY_FILE || !fs.existsSync(KEY_FILE)) {
    console.error("❌ GSC_KEY_FILE not set or file not found.");
    console.error("   Create a service account key and set GSC_KEY_FILE in .env");
    process.exit(1);
  }
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
  });
  return auth;
}

export async function pullGscData(days = 28) {
  const auth = await getAuth();
  const webmasters = google.webmasters({ version: "v3", auth });

  const endDate = new Date().toISOString().split("T")[0];
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  console.log(`📊 Pulling GSC data: ${startDate} → ${endDate}`);

  const res = await webmasters.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate,
      endDate,
      dimensions: ["query", "page"],
      rowLimit: 25000,
    },
  });

  const rows = res.data.rows ?? [];
  console.log(`   Found ${rows.length} rows`);

  ensureDir();
  const outPath = path.join(DATA_DIR, `${endDate}.json`);
  fs.writeFileSync(outPath, JSON.stringify(rows, null, 2), "utf-8");
  console.log(`💾 Saved to ${outPath}`);

  return rows;
}

// CLI entry
if (import.meta.main) {
  pullGscData().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
