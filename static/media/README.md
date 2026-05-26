# Hero background video

Place Yuval’s hero clip here:

- **File:** `hero-yuval.mp4` (H.264, no audio, under ~8MB recommended)
- **Optional WebM:** `hero-yuval.webm` for smaller payloads

The landing hero loads this after first paint so Lighthouse LCP stays on the poster (`/og-image.webp`).

After adding the file, set `heroVideo` in `src/lib/seo/config.ts` to `"/media/hero-yuval.mp4"`.
