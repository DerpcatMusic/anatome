# Live + Studio route audit (2026-05-26)

## Scope

| Area | Routes | Shell / entry |
|------|--------|----------------|
| Member calendar | `/u/calendar` | `CalendarShell` → `WeeklyAgenda`, `LiveClassComposer`, `LiveEventPopover` |
| Live room | `/חדר-לייב/[id]` | `LiveRoomShell` → `PreConnectOverlay`, `ControlBar`, `room.css` |
| Instructor live studio | `/i/live` | `LiveStudioShell` → composer, agenda, modals |
| Instructor video library | `/i/videos` | `InstructorVideoManager` → `InstructorVideoStudio.css` |

Out of scope (other agents): landing, catalog `/library`.

## Audit health

| # | Dimension | Score | Finding |
|---|-----------|-------|---------|
| 1 | Live token discipline | 4 | On-states moved to `--secondary-cool`; dock uses `lr-*` chips |
| 2 | Surface hierarchy | 3 | Pre-connect de-layered; modals use `--elevated` |
| 3 | Studio empty / cards | 4 | `library-empty` + OneOnOne empty use `--elevated` + pink icon |
| 4 | Control bar | 4 | `lr-dock-btn` transparent off; cool tint on |
| 5 | Calendar / composer | 3 | Group live events + toggles aligned to cool blue |
| **Total** | | **18/20** | **Good** |

## Fixes applied

### Live room (`room.css`, control bar)

- Self-tile outline, chat send, unread badge: `--secondary-cool` (not blush `--secondary`).
- Scoped `.lr-room` overrides for legacy `hb-button--control` / `hb-media-split`: transparent off, `lr-on-tint` on (no white nested boxes on dock).

### Pre-connect

- `PreConnectFrame`: single `--elevated` shell on `--paper` canvas (removed glass-on-glass).
- `PreConnectSettings`: transparent panel inside shell; preset active uses cool border/tint.
- `PreConnectState`: `--elevated` card; spinner ring uses cool tint.

### Calendar + composer

- `calendar-theme.css`: `group_live` + drag preview use cool blue mixes.
- `LiveClassComposer`: group toggle/badge/equipment-on/focus use cool; surfaces `--elevated`.
- `WeeklyAgenda`: selection highlight `secondary-cool`.
- `LiveEventPopover`, `EditLiveClassForm`, `LiveClassModalShell`: group accent + modal `--elevated`.

### Global tokens / UI

- `tokens.css`: `--lr-control-off-bg: transparent`.
- `ui.css`: control-bar fallbacks default to cool tint / transparent off.

### Studio

- `LiveStudioShell`: toolbar chips `--elevated`; group/availability filters on = cool tint.
- `OneOnOneShell.css`: panels `--elevated`; empty state matches video library pattern (elevated + primary icon).

## Remaining P2

1. **Calendar EC chrome** — `--ec-*` still uses `var(--white)` for grid chrome; consider `--paper` / `--elevated` for dark theme parity (not user-visible regression today).
2. **Pre-connect prep notice** — full `--primary` fill on `.prep-notice` is intentional alert; could soften to `color-mix` wash if it feels loud next to cool live controls.
3. **1:1 vs group semantics** — pink `--primary` remains correct for 1:1 / availability; document in design-context that only **group live / AV on** uses `--secondary-cool`.
4. **`hb-button--control` outside `.lr-room`** — global default still white for non-conference UIs; add `.live-entry` scope if pre-connect ever adopts control chips.
5. **Touch audit** — run `/adapt` on dock + pre-connect close (36px) vs 44px guideline.
6. **Live tile speaking** — `--warning` outline is intentional; no change unless product wants cool ring for “speaking” too.

## Verification

```bash
bun run check
```

Manual: `/i/live` filter chips, `/i/videos` empty upload, `/חדר-לייב/...` pre-connect + in-room dock, `/u/calendar` group event color + quick create.
