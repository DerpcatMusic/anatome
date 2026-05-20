import { t as SITE } from "../../../chunks/config.js";
import { n as routePath } from "../../../chunks/context.js";
//#region src/routes/robots.txt/+server.ts
var prerender = true;
var DISALLOWED = [
	"/u/dashboard",
	"/u/calendar",
	"/u/one-on-one",
	"/u/videos",
	"/i/live",
	routePath("liveRoom"),
	"/u/profile",
	routePath("watch"),
	routePath("onboarding"),
	"/callback",
	"/_app",
	"/200.html"
];
async function GET() {
	const lines = [
		"User-agent: *",
		...DISALLOWED.map((p) => `Disallow: ${p}`),
		"Disallow: /*?*",
		"Allow: /$",
		"Allow: /sitemap.xml",
		"Allow: /robots.txt",
		"",
		"User-agent: Googlebot",
		"Allow: /",
		...DISALLOWED.map((p) => `Disallow: ${p}`),
		"",
		`Sitemap: ${SITE.domain}/sitemap.xml`,
		"",
		"Crawl-delay: 1"
	];
	return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
//#endregion
export { GET, prerender };
