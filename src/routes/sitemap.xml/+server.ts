import { SITE } from "$lib/seo/config";
import fs from "node:fs";
import path from "node:path";

export const prerender = true;

interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
  images?: string[];
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function getSeoSlugs(): string[] {
  const dir = path.resolve("content/seo");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(".md", ""));
}

export async function GET() {
  const today = new Date().toISOString().split("T")[0];
  const seoSlugs = getSeoSlugs();

  const entries: SitemapEntry[] = [
    {
      url: `${SITE.domain}/`,
      lastmod: today,
      changefreq: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE.domain}/concept`,
      lastmod: today,
      changefreq: "monthly",
      priority: 0.3,
    },
    {
      url: `${SITE.domain}/llms.txt`,
      lastmod: today,
      changefreq: "weekly",
      priority: 0.5,
    },
  ];

  // Add SEO pages
  for (const slug of seoSlugs) {
    entries.push({
      url: `${SITE.domain}/${slug}`,
      lastmod: today,
      changefreq: "weekly",
      priority: 0.8,
    });
  }

  // Static legal pages
  const legalPages = ["terms", "privacy", "cancellations", "accessibility", "health"];
  for (const page of legalPages) {
    entries.push({
      url: `${SITE.domain}/legal/${page}`,
      lastmod: today,
      changefreq: "yearly",
      priority: 0.3,
    });
  }

  const lines: string[] = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`,
  ];

  for (const entry of entries) {
    lines.push(`  <url>`);
    lines.push(`    <loc>${escapeXml(entry.url)}</loc>`);
    if (entry.lastmod) lines.push(`    <lastmod>${entry.lastmod}</lastmod>`);
    if (entry.changefreq) lines.push(`    <changefreq>${entry.changefreq}</changefreq>`);
    if (entry.priority !== undefined) lines.push(`    <priority>${entry.priority.toFixed(1)}</priority>`);
    if (entry.images) {
      for (const img of entry.images) {
        lines.push(`    <image:image>`);
        lines.push(`      <image:loc>${escapeXml(img)}</image:loc>`);
        lines.push(`    </image:image>`);
      }
    }
    lines.push(`  </url>`);
  }

  lines.push(`</urlset>`);

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
