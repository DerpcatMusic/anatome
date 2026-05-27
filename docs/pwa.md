# PWA — AnatoMe

## Overview

The app is installable as a Progressive Web App with:

- Web App Manifest (`static/manifest.webmanifest`)
- Service worker via `vite-plugin-pwa` (`src/sw.ts`, injectManifest)
- Web Push for class reminders (Convex + `web-push`)
- Email reminders (Resend) and in-app `liveAlert` banner

## Environment variables

### Frontend (build time)

| Variable | Description |
|----------|-------------|
| `PUBLIC_VAPID_PUBLIC_KEY` | URL-safe base64 public VAPID key (browser subscribe) |

### Convex

| Variable | Description |
|----------|-------------|
| `VAPID_PUBLIC_KEY` | Same public key as above |
| `VAPID_PRIVATE_KEY` | VAPID private key |
| `VAPID_SUBJECT` | Optional `mailto:` or `https:` subject (defaults to `FRONTEND_URL`) |
| `FRONTEND_URL` | Public site URL for email/push deep links |

Generate keys:

```bash
npx web-push generate-vapid-keys
```

Set in Convex:

```bash
npx convex env set VAPID_PUBLIC_KEY "<public>"
npx convex env set VAPID_PRIVATE_KEY "<private>"
npx convex env set FRONTEND_URL "https://www.anatome.co.il"
```

Set for Cloudflare/production build:

```
PUBLIC_VAPID_PUBLIC_KEY=<same public key>
```

## iOS install + push

1. Open site in **Safari**
2. Share → **Add to Home Screen**
3. Open app from home screen (standalone)
4. Profile → **התראות ואפליקציה** → enable push (user gesture required)

Push does **not** work in Safari tabs on iOS — only installed PWAs (16.4+).

## Android / desktop Chromium

1. Use **Install** in profile notifications card, or browser install prompt
2. Enable push in profile settings

## Testing checklist

- [ ] `npm run build` succeeds; `build/sw.js` exists
- [ ] Lighthouse PWA audit passes on HTTPS deploy
- [ ] Install on Android Chrome + iOS home screen
- [ ] Subscribe to push → Convex `pushSubscriptions` row created
- [ ] Due reminder sends push + email (with Resend configured)
- [ ] Tap notification opens live room URL
- [ ] Live class + Mux playback work with SW active
- [ ] `deliveryScheduledAt` prevents duplicate cron sends

## Caching policy

- Precache: app shell, icons, hashed `/_app/immutable/*`
- **NetworkOnly**: `*.convex.cloud`, LiveKit, Mux stream URLs
- Fonts: stale-while-revalidate / cache-first
