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
