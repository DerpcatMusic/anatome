/**
 * Pull GSC data using OAuth2 (personal account) instead of Service Account.
 * Use this when Search Console UI can't find your service account email.
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { google } from "googleapis";

const SITE_URL = process.env.GSC_SITE_URL ?? "https://www.anatome.co.il/";
const DATA_DIR = path.resolve(import.meta.dirname, "../data/gsc");
const TOKEN_PATH = path.resolve(import.meta.dirname, "../.keys/oauth-token.json");
const CREDS_PATH = process.env.GOOGLE_OAUTH_CREDENTIALS_JSON ?? "";

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

async function getAuth() {
  if (!CREDS_PATH || !fs.existsSync(CREDS_PATH)) {
    console.error("❌ GOOGLE_OAUTH_CREDENTIALS_JSON not set or file not found.");
    console.error("   Run: bun run oauth-setup  (or use service account with bun run pull)");
    process.exit(1);
  }
  if (!fs.existsSync(TOKEN_PATH)) {
    console.error("❌ OAuth token not found at", TOKEN_PATH);
    console.error("   Run: bun run oauth-setup  first");
    process.exit(1);
  }

  const keys = JSON.parse(fs.readFileSync(CREDS_PATH, "utf-8"));
  const oAuth2Client = new google.auth.OAuth2(
    keys.installed?.client_id ?? keys.web?.client_id,
    keys.installed?.client_secret ?? keys.web?.client_secret,
    "http://localhost:3333/oauth2callback"
  );

  const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf-8"));
  oAuth2Client.setCredentials(tokens);

  // Auto-refresh if needed
  oAuth2Client.on("tokens", (newTokens) => {
    if (newTokens.refresh_token) {
      tokens.refresh_token = newTokens.refresh_token;
    }
    tokens.access_token = newTokens.access_token;
    tokens.expiry_date = newTokens.expiry_date;
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
  });

  return oAuth2Client;
}

export async function pullGscDataOAuth(days = 28) {
  const auth = await getAuth();
  const webmasters = google.webmasters({ version: "v3", auth });

  const endDate = new Date().toISOString().split("T")[0];
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  console.log(`📊 Pulling GSC data (OAuth2): ${startDate} → ${endDate}`);

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

if (import.meta.main) {
  pullGscDataOAuth().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
