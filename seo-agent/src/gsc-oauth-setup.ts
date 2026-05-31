import "dotenv/config";
import http from "node:http";
import url from "node:url";
import { google } from "googleapis";
import fs from "node:fs";
import path from "node:path";

const PORT = 3333;
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;

/**
 * OAuth2 Setup for Google Search Console API
 * 
 * This is the fallback when service accounts can't be added to Search Console.
 * You authenticate as YOURSELF (the human owner) and we store a refresh token.
 */

async function main() {
  console.log("🔐 AnatoMe SEO Agent — OAuth2 Setup\n");
  
  // Check for existing credentials
  const credsPath = process.env.GOOGLE_OAUTH_CREDENTIALS_JSON;
  if (!credsPath || !fs.existsSync(credsPath)) {
    console.log("❌ Missing OAuth2 credentials file.");
    console.log("\n📋 Setup steps:");
    console.log("1. Go to https://console.cloud.google.com/apis/credentials");
    console.log("2. Click 'Create Credentials' → 'OAuth client ID'");
    console.log("3. Application type: 'Desktop app'");
    console.log("4. Name: 'AnatoMe SEO Agent'");
    console.log("5. Download the JSON file");
    console.log("6. Set GOOGLE_OAUTH_CREDENTIALS_JSON in .env to that file path\n");
    process.exit(1);
  }

  const keys = JSON.parse(fs.readFileSync(credsPath, "utf-8"));
  const oAuth2Client = new google.auth.OAuth2(
    keys.installed?.client_id ?? keys.web?.client_id,
    keys.installed?.client_secret ?? keys.web?.client_secret,
    REDIRECT_URI
  );

  // Check if we already have a refresh token
  const tokenPath = path.resolve(import.meta.dirname, "../.keys/oauth-token.json");
  if (fs.existsSync(tokenPath)) {
    console.log("✅ OAuth token already exists at:", tokenPath);
    console.log("   You can run 'bun run pull-oauth' to use it.\n");
    const existing = JSON.parse(fs.readFileSync(tokenPath, "utf-8"));
    console.log("   Token scopes:", existing.scope);
    return;
  }

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/webmasters.readonly"],
    prompt: "consent", // Forces refresh token even if user previously authorized
  });

  console.log("🔗 Opening browser for OAuth2 authorization...\n");
  console.log("   If browser doesn't open, copy this URL:\n");
  console.log("   " + authUrl + "\n");

  // Try to open browser
  try {
    const { exec } = await import("node:child_process");
    const openCommand = process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
    exec(`${openCommand} "${authUrl}"`);
  } catch {
    // Browser open failed, user will copy-paste
  }

  // Start local server to catch the callback
  const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url!, true);
    
    if (parsedUrl.pathname !== "/oauth2callback") {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const code = parsedUrl.query.code as string;
    const error = parsedUrl.query.error as string;

    if (error) {
      res.writeHead(400, { "Content-Type": "text/html" });
      res.end(`<h1>❌ Error</h1><p>${error}</p>`);
      server.close();
      process.exit(1);
    }

    if (!code) {
      res.writeHead(400);
      res.end("Missing code");
      return;
    }

    try {
      const { tokens } = await oAuth2Client.getToken(code);
      
      // Save token
      const keysDir = path.resolve(import.meta.dirname, "../.keys");
      if (!fs.existsSync(keysDir)) fs.mkdirSync(keysDir, { recursive: true });
      fs.writeFileSync(tokenPath, JSON.stringify(tokens, null, 2));
      
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(`
        <html dir="rtl">
        <head><title>אנטומי SEO — אישור הושלם</title></head>
        <body style="font-family: system-ui; text-align: center; padding: 4rem; background: #faf8f3;">
          <h1>✅ האישור הושלם!</h1>
          <p>הטוקן נשמר. אתה יכול לסגור את החלון ולחזור לטרמינל.</p>
        </body>
        </html>
      `);
      
      console.log("\n✅ OAuth token saved successfully!");
      console.log("   Location:", tokenPath);
      console.log("   You can now run: bun run pull-oauth\n");
      
      server.close();
      process.exit(0);
    } catch (e: any) {
      res.writeHead(500, { "Content-Type": "text/html" });
      res.end(`<h1>❌ Token exchange failed</h1><pre>${e.message}</pre>`);
      server.close();
      process.exit(1);
    }
  });

  server.listen(PORT, () => {
    console.log(`🖥️  Waiting for callback on http://localhost:${PORT}/oauth2callback`);
  });
}

main().catch(console.error);
