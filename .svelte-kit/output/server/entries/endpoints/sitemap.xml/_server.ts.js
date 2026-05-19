import { t as SITE } from "../../../chunks/config.js";
//#region src/routes/sitemap.xml/+server.ts
var prerender = true;
var ENTRIES = [{
	url: `${SITE.domain}/`,
	lastmod: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
	changefreq: "daily",
	priority: 1
}];
function escapeXml(str) {
	return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
async function GET() {
	const lines = [`<?xml version="1.0" encoding="UTF-8"?>`, `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`];
	for (const entry of ENTRIES) {
		lines.push(`  <url>`);
		lines.push(`    <loc>${escapeXml(entry.url)}</loc>`);
		if (entry.lastmod) lines.push(`    <lastmod>${entry.lastmod}</lastmod>`);
		if (entry.changefreq) lines.push(`    <changefreq>${entry.changefreq}</changefreq>`);
		if (entry.priority !== void 0) lines.push(`    <priority>${entry.priority.toFixed(1)}</priority>`);
		if (entry.images) for (const img of entry.images) {
			lines.push(`    <image:image>`);
			lines.push(`      <image:loc>${escapeXml(img)}</image:loc>`);
			lines.push(`    </image:image>`);
		}
		lines.push(`  </url>`);
	}
	lines.push(`</urlset>`);
	return new Response(lines.join("\n"), { headers: {
		"Content-Type": "application/xml; charset=utf-8",
		"Cache-Control": "public, max-age=3600"
	} });
}
//#endregion
export { GET, prerender };
