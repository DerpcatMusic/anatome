# `reference/livekit-components-js/` (kept on disk)

The directory is **not** imported by the Vite build, Convex, or deploy scripts (~14 MB upstream LiveKit Components JS monorepo used while porting to `$lib/livekit`).

**Why keep it:** side-by-side comparison when upgrading `livekit-client` / `@livekit/components-core`, and pointers in `docs/LIVEKIT_REFACTOR_PLAN.md` and `docs/live-join-flow.md`.

**Safe to delete locally** if you do not need the reference tree; the app only depends on npm packages and `src/lib/livekit/`.
