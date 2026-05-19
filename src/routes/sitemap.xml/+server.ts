import { SITE } from "$lib/seo/config";

export const prerender = true;

interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
  images?: string[];
}

const ENTRIES: SitemapEntry[] = [
  {
    url: `${SITE.domain}/`,
    lastmod: new Date().toISOString().split("T")[0],
    changefreq: "daily",
    priority: 1.0,
  },
  // Add more public pages here as they become available
];

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const lines: string[] = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`,
  ];

  for (const entry of ENTRIES) {
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
