import "dotenv/config";
import { google } from "googleapis";

const KEY_FILE = process.env.GSC_KEY_FILE ?? "";

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
  });
  const webmasters = google.webmasters({ version: "v3", auth });
  
  console.log("📋 Sites this service account can access:\n");
  try {
    const res = await webmasters.sites.list();
    const sites = res.data.siteEntry ?? [];
    if (sites.length === 0) {
      console.log("   (none — the service account has no Search Console access)");
    }
    for (const site of sites) {
      console.log(`   ${site.siteUrl} — ${site.permissionLevel}`);
    }
  } catch (e: any) {
    console.log("   Error:", e.message);
  }
}

main();
