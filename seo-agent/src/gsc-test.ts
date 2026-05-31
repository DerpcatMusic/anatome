import "dotenv/config";
import { google } from "googleapis";

const KEY_FILE = process.env.GSC_KEY_FILE ?? "";

async function testSite(url: string) {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
  });
  const webmasters = google.webmasters({ version: "v3", auth });
  try {
    const res = await webmasters.sites.get({ siteUrl: url });
    console.log(`✅ ${url} — ACCESS GRANTED`);
    console.log(`   Permission level: ${res.data.permissionLevel}`);
    return true;
  } catch (e: any) {
    console.log(`❌ ${url} — ${e.message?.split(".")[0] ?? "Failed"}`);
    return false;
  }
}

async function main() {
  console.log("🔍 Testing Search Console property access...\n");
  const urls = [
    "https://www.anatome.co.il/",
    "https://anatome.co.il/",
    "sc-domain:anatome.co.il",
    "http://www.anatome.co.il/",
  ];
  for (const url of urls) {
    await testSite(url);
  }
  console.log("\n👉 Use the URL that shows ✅ ACCESS GRANTED in your .env");
}

main();
