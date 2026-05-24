# HomeBody

Hebrew-first Pilates platform built with Astro 6, Svelte 5, Bun, Convex, and Convex Auth.

## Commands

```sh
bun install
bun run dev
bun run build
bun run dev:convex
```

## Current Slice

- Static Astro landing page.
- Svelte sign-in/sign-up island wired to Convex Auth password flow.
- Authenticated dashboard shell.
- Pilates onboarding after auth.
- Reusable `Button`, `Input`, and `Notice` primitives.
- Plain CSS reset/tokens/global styles.
- Convex Auth password-provider skeleton.
- Initial Convex schema for auth, plans, credit buckets, and member profiles.

## Next Step

Run Convex setup so generated files exist:

```sh
bunx convex dev
```

Research notes live in `docs/research.md`.

Astro browser code needs:

```sh
PUBLIC_CONVEX_CLIENT_URL=<same value as CONVEX_URL>
```

Convex Auth needs this on the Convex deployment:

```sh
bunx convex env set SITE_URL http://localhost:4321
AUTH_ENV_FILE="$(node scripts/set-convex-auth-keys.mjs)"
bunx convex env set --from-file "$AUTH_ENV_FILE" --force
```

For production, set `SITE_URL` to the public HomeBody domain.

## Cloudflare (Workers static assets)

This app is a **static** SvelteKit site (`adapter-static` → `build/`). Cloudflare is moving new work to **Workers with static assets** ([migration guide](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/)); Pages still works, but Workers is the long-term default.

You do **not** need `@sveltejs/adapter-cloudflare` or SSR on Cloudflare. Convex is still your API/auth backend; the Worker only serves files.

| Setting | Value |
|---------|--------|
| **Build command** | `bun run build` |
| **Deploy command** | `bun run deploy` (`wrangler deploy` — uses `[assets]` in `wrangler.toml`) |

`wrangler.toml` deploys `build/` as static assets plus a tiny `worker/index.ts` that serves `app.html` on 404 (SPA shell). Do **not** use `/* /app.html 200` in `_redirects` on Workers — it breaks `/_app/*` assets and `html_handling` turns `.html` into 307 redirects (`/200`, `/app`, …), causing **522** timeouts.

Local full pipeline:

```sh
bun run pages:deploy
```

If you stay on a **Pages** Git project instead of Workers: build command `bun run build`, output `build`, deploy `bunx wrangler pages deploy build --project-name=anatome` — do not use bare `wrangler deploy` without `[assets]` in `wrangler.toml`.

Set this **environment variable** for Production (and Preview if you use preview deploys):

| Variable | Example |
|----------|---------|
| `PUBLIC_CONVEX_CLIENT_URL` | `https://your-deployment.convex.cloud` |

Use your **production** Convex deployment URL (from `bunx convex dashboard` or `.env.local` after `bunx convex dev`). It is public and gets inlined into the static bundle at build time.

`vite.config.js` also accepts `CONVEX_URL` if you prefer that name.

## Resend (transactional email)

Auth OTP / magic-link emails use the official [`@convex-dev/resend`](https://www.npmjs.com/package/@convex-dev/resend) component. Sending domain: **`anatome.dolmengatemedia.com`** (subdomain under Dolmen Gate Media for Resend free-tier domain limits).

1. In [Resend](https://resend.com), add and verify the domain `anatome.dolmengatemedia.com` (DNS records on the parent zone).
2. Create an API key and set Convex env vars:

```sh
bunx convex env set RESEND_API_KEY "re_..."
bunx convex env set RESEND_FROM "AnatoMe <noreply@anatome.dolmengatemedia.com>"
bunx convex env set RESEND_TEST_MODE false
```

`RESEND_TEST_MODE` defaults to **on** when `FRONTEND_URL` is localhost. While test mode is on, Resend only delivers to test inboxes (`delivered@resend.dev`, etc.).

3. Optional delivery webhooks (bounces, complaints, opens):

```sh
bunx convex env get CONVEX_SITE_URL
# → register https://<deployment>.convex.site/resend-webhook in Resend (enable email.* events)
bunx convex env set RESEND_WEBHOOK_SECRET "<secret from Resend>"
```

Local dev without `RESEND_API_KEY` still logs the OTP and magic link to the Convex terminal.
