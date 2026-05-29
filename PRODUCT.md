# Product

## Register

product

## Users

Hebrew-speaking adults, mostly women, practicing rehabilitative Pilates at home. Many manage pain, postpartum recovery, or pathology-specific needs (back, shoulder, knees, post-surgery). They want professional, anatomy-aware guidance without clinic pressure or generic fitness hype. Context varies: onboarding and matching before first class, booking from a calendar, joining a live room with camera and mic, watching recorded lessons, or managing credits and profile between sessions.

Instructors run live and 1:1 sessions, upload and schedule content, and see member rosters and agendas. Members consume classes, reserve seats, and join LiveKit rooms. Both roles need trust, clarity, and low cognitive load while moving through real tasks.

## Product Purpose

AnatoMe (אנטומי) is an online rehabilitative Pilates platform: pathology-aware programs, live group classes, on-demand video (Mux), and private 1:1 sessions. Success means members feel safely guided at home, complete the right class for their condition, and return; instructors can run sessions reliably with clear roster, media, and scheduling tools. The product competes on clinical credibility and warmth, not on spectacle or gamified fitness.

Core jobs:

- **Discover and commit**: understand the offer, match to needs, onboard, buy or use credits.
- **Plan and show up**: calendar, reminders, join live or 1:1 on time with working A/V.
- **Practice**: follow instruction in live or VOD with readable UI in RTL Hebrew.
- **Stay in the loop**: profile, credits (vod / live / 1:1), billing, and support paths.

Stack in service of those jobs: SvelteKit frontend, Convex backend and auth, LiveKit for live rooms, typesafe-i18n (Hebrew-first), Bun toolchain, Cloudflare deployment.

## Brand Personality

Warm, trustworthy, anatomically precise. Voice: conversational Hebrew ("יאללה", direct "you") while staying clinically credible. Three words: **מדויק · חם · שקט**. Product UI should feel like a calm studio extension, not a startup dashboard or loud fitness app. Delight is subtle and domain-specific; never blocking the task.

## Anti-references

- Generic fitness marketing: neon gradients, before/after hype, emoji clutter, "crush your goals" tone.
- Dual warm+cool gradients on one surface; pink/coral legacy fitness palette.
- AI-slop product UI: mismatched controls, decorative motion, display fonts on labels, invented affordances for standard tasks (save, join, mute).
- MacroFlow-style jargon in headlines; vague loading copy ("מכינים את החוויה שלך").
- Modal-first flows where inline or progressive disclosure would do.
- English-first or LTR-assumed layouts that fight Hebrew reading order.

## Design Principles

1. **Earned familiarity** — patterns users know from strong tools (clear nav, consistent buttons, predictable forms). Strangeness must serve a real need, not decoration.
2. **Clarity over cleverness** — one idea per block; specific CTAs; hierarchy through spacing and type scale, not novelty.
3. **Clinical warmth** — credible, calm, never cold-clinical or hype-fitness. Copy names real conditions and outcomes where appropriate.
4. **Task-first surfaces** — especially in live room, calendar, and checkout: minimize chrome, surface state (muted, connecting, full, error) explicitly.
5. **Tokens, not one-offs** — extend shared semantic tokens (`tokens.css`) for marketing and app; credit types (vod / live / 1:1) stay visually distinct with a consistent coin language.

## Accessibility & Inclusion

- **RTL-first**: Hebrew as primary locale; layout, icons, and motion respect `dir="rtl"`.
- **Target**: align with published legal accessibility page; aim for WCAG 2.1 AA on member and instructor flows.
- **Motion**: honor `prefers-reduced-motion`; no bounce/elastic marketing motion; live UI motion only for state (connecting, speaking, errors).
- **Contrast and theme**: light and dark themes with semantic foreground/muted roles; avoid relying on color alone for credit type or session state.
- **Live A/V**: clear labels for mic/camera/speaker; browser permission and failure states surfaced in plain Hebrew.
