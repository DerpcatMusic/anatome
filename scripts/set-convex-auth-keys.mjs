import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { exportJWK, exportPKCS8, generateKeyPair } from "jose";

const keys = await generateKeyPair("RS256", {
  extractable: true,
});

const privateKey = await exportPKCS8(keys.privateKey);
const publicKey = await exportJWK(keys.publicKey);
const jwks = JSON.stringify({ keys: [{ use: "sig", ...publicKey }] });

const dir = await mkdtemp(join(tmpdir(), "homebody-convex-auth-"));
const envPath = join(dir, "auth.env");

await writeFile(
  envPath,
  [
    `JWT_PRIVATE_KEY=${JSON.stringify(privateKey.trimEnd().replace(/\n/g, " "))}`,
    `JWKS=${jwks}`,
    "",
  ].join("\n"),
);

console.log(envPath);

process.on("exit", () => {
  void rm(dir, { recursive: true, force: true });
});
