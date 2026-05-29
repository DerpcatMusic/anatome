# Responsive breakpoints

Canonical tokens live in `src/styles/tokens.css`:

| Token | Value | Use for |
|-------|-------|---------|
| `--bp-xs` | 20rem (320px) | Small phones |
| `--bp-sm` | 32rem (512px) | Large phones |
| `--bp-md` | 48rem (768px) | Tablets |
| `--bp-lg` | 64rem (1024px) | Desktop |

Legacy one-off breakpoints still exist in older CSS (520, 640, 720, 860px). **New rules should prefer `--bp-*` via `min-width` media queries.**

App shell mobile cutoff: **860px** (sidebar stacks / live room hides chrome).

Live room uses `LiveRoomShell` on all viewports.
