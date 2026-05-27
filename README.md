# AnatoMe

Hebrew-first Pilates platform built with Astro 6, Svelte 5, Bun, Convex, and Convex Auth.

## Commands

```sh
bun install
bun run dev
bun run build
bun run dev:convex
```

**Bundle size:** `vite.config.js` sets `build.chunkSizeWarningLimit` (1100 kB) for lazy Mux/LiveKit chunks. To inspect output sizes after build, use `bun run build` and review the Vite rolldown size table (no bundle analyzer in devDeps yet).

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

For production, set `SITE_URL` to the public AnatoMe domain.

## Cloudflare (Workers static assets)

**Pushing to `master` does not deploy by itself** unless CI or Cloudflare Git integration is configured. This repo uses **GitHub Actions** (`.github/workflows/deploy-cloudflare.yml`) on every push to `master`.

### GitHub Actions secrets (required for deploy)

In GitHub → **Settings → Secrets and variables → Actions**, add:

| Secret | Value |
|--------|--------|
| `CLOUDFLARE_API_TOKEN` | API token with **Workers Scripts Edit** (+ Account read) |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID |
| `PUBLIC_CONVEX_CLIENT_URL` | `https://<prod>.convex.cloud` (no trailing `/`) |
| `PUBLIC_MUX_ENV_KEY` | Optional; leave empty if unused |

Without `PUBLIC_CONVEX_CLIENT_URL`, `bun run build` **fails** — Cloudflare dashboard builds show the same error.

After adding secrets, push to `master` or run the workflow manually (**Actions → Deploy to Cloudflare → Run workflow**).

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
| `PUBLIC_CONVEX_CLIENT_URL` | `https://your-deployment.convex.cloud` (no trailing `/`) |

Use your **production** Convex deployment URL (from `bunx convex dashboard` or `.env.local` after `bunx convex dev`). It is public and gets inlined into the static bundle at build time.

`vite.config.js` also accepts `CONVEX_URL` if you prefer that name.

## Resend (transactional email)

Auth OTP / magic-link emails use the official [`@convex-dev/resend`](https://www.npmjs.com/package/@convex-dev/resend) component. The **From** domain must be [verified in Resend](https://resend.com/domains) (403 `validation_error` otherwise).

1. Use your verified domain (e.g. **`dolmengatemedia.com`**) or add DNS for a subdomain and wait until Resend shows it verified.
2. Create an API key and set Convex env vars on **each** deployment (dev + prod):

```sh
bunx convex env set RESEND_API_KEY "re_..."
bunx convex env set RESEND_FROM "AnatoMe <noreply@dolmengatemedia.com>"
bunx convex env set FRONTEND_URL "https://www.anatome.co.il"
bunx convex env set RESEND_TEST_MODE false
```

`RESEND_TEST_MODE` defaults to **on** when `FRONTEND_URL` is unset or points at localhost. While test mode is on, **auth OTPs are not sent through Resend** — they are logged in the Convex terminal so you can sign in with any email. Set `RESEND_SKIP_SEND=true` on a non-local deployment for the same behavior. Set `RESEND_SKIP_SEND=false` if you want to exercise Resend in test mode (recipients must be `*@resend.dev`). **Production:** set `FRONTEND_URL` to your public site and `RESEND_TEST_MODE=false`.

**OTP not arriving but sign-in “succeeds”?** The Resend component sends asynchronously. Check Convex **Logs** for `permanent_failure` / `Resend API error`, and the **resend** component → **emails** table for `failed` rows. A 403 *domain is not verified* means `RESEND_FROM` must use a domain that shows **Verified** on Resend (not only planned).

3. Optional delivery webhooks (bounces, complaints, opens):

```sh
bunx convex env get CONVEX_SITE_URL
# → register https://<deployment>.convex.site/resend-webhook in Resend (enable email.* events)
bunx convex env set RESEND_WEBHOOK_SECRET "<secret from Resend>"
```

Local dev (test mode / `RESEND_SKIP_SEND`) logs the OTP and magic link to the Convex terminal; `RESEND_API_KEY` is optional there.
