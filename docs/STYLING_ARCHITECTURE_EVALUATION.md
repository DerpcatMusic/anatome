# Styling Architecture Evaluation: Current vs. UnoCSS

> Date: 2026-05-20  
> Context: Post-audit, all `:global()` eliminated, large style blocks extracted, dark mode implemented.

## Current Architecture

| Aspect | Implementation |
|--------|---------------|
| Methodology | BEM (`hb-*`) + component-scoped CSS files |
| Theming | CSS custom properties (`tokens.css`) |
| Global styles | `ui.css`, `components.css`, `global.css` |
| Component styles | Standalone `.css` files co-located with `.svelte` |
| Bundle size | ~160KB built CSS (includes scoped + global) |
| Runtime | Zero CSS-in-JS runtime |
| Dark mode | `prefers-color-scheme` in `tokens.css` ✅ |

## What UnoCSS Would Give You

| Benefit | Reality for This Codebase |
|---------|--------------------------|
| Smaller CSS bundle | Marginal. Current CSS is already well-factored; UnoCSS shines when you have *unused* CSS bloat. We don't. |
| No naming fatigue | True, but BEM naming is already solved — all components use consistent `hb-*` prefixes. |
| Faster prototyping | Irrelevant. The app is production, not a prototype. |
| Design system enforcement | Already enforced via `tokens.css` + BEM conventions. |
| Atomic granularity | Would actually hurt readability for complex components (live room, studio forms). |

## What UnoCSS Would Cost You

| Cost | Estimate |
|------|----------|
| Migration effort | 2–3 weeks full-time |
| Files to rewrite | ~50 Svelte components + 15 CSS files |
| Class name conversions | ~800 BEM classes → utility atoms |
| Risk of regressions | High — visual bugs from class ordering, specificity changes |
| Team retraining | Everyone learns UnoCSS shorthand syntax |
| Dark mode rebuild | Re-implement in UnoCSS theme config |

## Direct Comparison: Complex Component

**Current (BEM + extracted CSS):**
```svelte
<!-- AppSidebar.svelte -->
<nav class="sidebar__nav">
  <a class="sidebar__link sidebar__link--live" href="/live">
    <span class="live-pulse" /> לייב
  </a>
</nav>
```
```css
/* AppSidebar.css */
.sidebar__link--live { color: var(--danger); font-weight: 800; }
.sidebar__link--live:hover { background: var(--danger-soft); }
```

**UnoCSS equivalent:**
```svelte
<nav class="flex flex-col min-h-0 py-2 pb-4 overflow-y-auto">
  <a class="flex items-center gap-3 px-[clamp(16px,3vw,32px)] py-3
            text-[var(--danger)] font-800 no-underline
            hover:bg-[var(--danger-soft)]" href="/live">
    <span class="w-2 h-2 rounded-full bg-[var(--danger)] animate-pulse" /> לייב
  </a>
</nav>
```

The UnoCSS version is **harder to read, harder to maintain, and harder to override**.

## The Verdict

**Do NOT migrate to UnoCSS.**

Your current architecture is *already* what a mature UnoCSS migration would asymptotically approach:

- ✅ Tokens centralize design decisions
- ✅ Component CSS files prevent leakage
- ✅ BEM naming is predictable
- ✅ No runtime overhead
- ✅ Dark mode works
- ✅ Build passes with zero errors

UnoCSS is a power tool for teams that started with messy CSS or need rapid experimentation. You have the opposite: a clean, production-grade system.

## Recommended Path Forward

Instead of a full rewrite, add **selective utility helpers** for the 20% of cases where atomic classes genuinely help:

```css
/* Add to global.css or a new utilities.css */
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.gap-3 { gap: var(--space-3); }
.gap-4 { gap: var(--space-4); }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0; }
```

Use these for **layout scaffolding only**:
```svelte
<div class="flex flex-col gap-4">
  <!-- complex child components keep their BEM classes -->
  <VideoCard class="video-card--featured" />
</div>
```

This gives you 80% of UnoCSS's convenience with 0% of its cost.

## If You Still Want UnoCSS

I can do it. It requires:

1. `bun add -D unocss @unocss/svelte-scoped`
2. `uno.config.ts` with custom rules mapping your tokens
3. Rewriting every component's class names
4. Removing all standalone `.css` files
5. Re-testing every page in both light and dark mode

Estimated time: **2–3 weeks**. Estimated value: **low** for this codebase.
