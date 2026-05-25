# SEO & Lighthouse (Astro-style static marketing)

The marketing homepage is **prerendered** (`+page.ts` → `prerender = true`) like Astro: HTML + minimal JS ship first; Convex/auth load only when needed.

## Already in place

- `SEO.svelte`: canonical, robots, Open Graph, Twitter, JSON-LD graph
- `sitemap.xml` / `robots.txt` prerender entries
- Hero **poster preload** (`fetchpriority="high"`) for LCP
- Mesh gradient **client-only** (no canvas cost in static HTML)
- Hero video **`preload="none"`** + idle load (poster stays LCP)
- Cloudflare immutable cache for `/_app/immutable/*`

## To reach high 90s / 100

1. **Add hero video** — `static/media/hero-yuval.mp4` (short, muted, &lt;8MB). See `static/media/README.md`.
2. **Real OG image** — 1200×630 WebP at `/og-image.webp` (Yuval + brand).
3. **Fonts** — subset Hebrew weights; `font-display: swap` (see `fonts.css`).
4. **Images** — explicit `width`/`height`, WebP/AVIF, lazy below fold.
5. **Third-party** — defer analytics; no render-blocking scripts on `/`.
6. **Run audits** on production URL with `bun run build && bun run preview`, then Lighthouse mobile + [PageSpeed Insights](https://pagespeed.web.dev/).

## SEO content

- One `<h1>` on home (hero)
- FAQ schema matches visible FAQ copy
- Legal pages linked from footer (crawl path)
