import { SITE } from "$lib/seo/config";
import { routePath } from "$lib/i18n/context";

export const prerender = true;

const DISALLOWED = [
  "/u/dashboard",
  "/u/calendar",
  "/u/one-on-one",
  "/u/videos",
  "/i/calendar",
  routePath("liveRoom"),
  routePath("watch"),
  routePath("onboarding"),
  "/callback",
  "/_app",
  "/app.html",
];

export async function GET() {
  const lines: string[] = [
    "# AI Crawlers — explicitly allowed",
    "User-agent: GPTBot",
    "Allow: /",
    "",
    "User-agent: ChatGPT-User",
    "Allow: /",
    "",
    "User-agent: ClaudeBot",
    "Allow: /",
    "",
    "User-agent: PerplexityBot",
    "Allow: /",
    "",
    "User-agent: Google-Extended",
    "Allow: /",
    "",
    "User-agent: Googlebot",
    "Allow: /",
    ...DISALLOWED.map((p) => `Disallow: ${p}`),
    "",
    "# General crawlers",
    "User-agent: *",
    ...DISALLOWED.map((p) => `Disallow: ${p}`),
    "Disallow: /*?*", // no query params
    "Allow: /$",
    "Allow: /sitemap.xml",
    "Allow: /robots.txt",
    "Allow: /llms.txt",
    "",
    `Sitemap: ${SITE.domain}/sitemap.xml`,
    "",
    "Crawl-delay: 1",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
