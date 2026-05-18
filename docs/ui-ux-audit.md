# HomeBody UI/UX Audit
**Date:** 2026-05-16  
**Scope:** Landing, Auth, Onboarding, Dashboard  
**Method:** Heuristic evaluation, cognitive load analysis, accessibility scan, flow mapping

---

## Executive Summary

| Dimension | Score | Verdict |
|-----------|-------|---------|
| Visual Identity | 2/4 | Directional but underdeveloped — border-heavy, zero imagery, no warmth |
| Cognitive Load | 2/4 | Onboarding dumps everything at once; dashboard is a data desert |
| Flow & Navigation | 2/4 | Linear but brittle — hard redirects, no back-buttons, dead-end states |
| Accessibility | 2/4 | Some semantic HTML, missing landmarks, tight line-heights, 42px touch targets |
| Responsive | 3/4 | Fluid type + clamp() is good; mobile stacking works but feels cramped |
| Microcopy & Tone | 2/4 | Dev messages leak to users; apologetic empty states; lacks warmth |

**Overall:** The bones are there — good token system, RTL Hebrew support, clean component model. But the user experience feels like a wireframe that shipped. The onboarding is cognitively aggressive, the dashboard is an empty shell, and the visual language doesn't yet evoke the calm, rehabilitative, body-aware quality of Pilates.

---

## 🔴 P0 — Critical Issues (Fix Before Anything Else)

### 1. Onboarding is a Cognitive Wall
**Where:** `/onboarding` → `OnboardingForm.svelte`

**Problem:** All 9 equipment options, 3 experience levels, 5 goals, and a free-text area are visible simultaneously. No progress indicator. No stepper. The user just signed up — they're excited, maybe anxious — and you hit them with a form that looks like a medical intake.

**Cognitive load count:** ~17 decision points visible at once. This is decision fatigue before the user has seen a single video.

**Fix:**
- Split into 3–4 progressive steps with a visible stepper (`01 / 04` style, matching your mono font)
- Step 1: Experience (1 choice, low friction)
- Step 2: Equipment (multi-select, contextual — "Based on your experience, most people start with...")
- Step 3: Goals (multi-select, 5 is fine for one screen)
- Step 4: Notes + confirmation (optional, with a prominent "Skip for now")
- Show progress bar. Celebrate completion.

### 2. Dev Messages Leak to Production Users
**Where:** `AuthPanel.svelte` line ~30

```
"שלחנו קוד כניסה לאימייל. בפיתוח אפשר לראות אותו בלוגים של Convex."
```

**Problem:** This tells real users to check Convex logs. It breaks trust and looks unprofessional.

**Fix:** Remove immediately. Replace with: `"שלחנו קוד כניסה לאימייל. בדקי את תיבת הדואר (ואת הספאם)."`

### 3. Hard Redirects Erase Browser History
**Where:** `OnboardingShell.svelte:25`, `AppShell.svelte`, `session.svelte.ts`

**Problem:** `window.location.replace("/app")` and `window.location.assign()` destroy back-button navigation. If a user accidentally clicks back from the dashboard, they can't return. If onboarding fails, they can't retry without re-authenticating.

**Fix:** Use a client-side router (or at least `history.pushState` + Astro view transitions). At minimum, replace `replace()` with `assign()` for onboarding→app so back button works.

### 4. Dashboard is a Dead End
**Where:** `Dashboard.svelte`

**Problem:** After completing onboarding, the user lands on a page that says "This will be the home for credits, classes, and lives. Currently showing onboarding profile." This is an apology, not a welcome.

The profile data is rendered as raw `<dl>` definition list — unstyled, cold, clinical. Four nav items (Video, Lives, Subscription) are dead `<span>` elements with zero visual distinction from working links.

**Fix:**
- Replace the apology with a warm welcome: "ברוכה הבאה, [name]! התחילי עם השיעור הראשון שלך."
- Style the profile data as a card or summary, not a data table
- Disabled nav items need `opacity: 0.5` + "בקרוב" badge, not identical styling to links
- Add a CTA: "עייני בשיעורים המוקלטים" or "קבעי שיעור חי ראשון" — give the user something to DO

---

## 🟠 P1 — Major UX Issues

### 5. Auth Panel Embedded in Hero is Conversion-Killing
**Where:** `index.astro`

**Problem:** The signup form is immediately visible on the landing page, inside the hero grid. For a Pilates platform — an emotional, trust-based purchase — this is like asking for a phone number before saying hello.

Users need to understand the value, feel the brand, and trust the instructor before giving their email. Lesly Logan's OPC site builds desire first, then gates content.

**Fix:**
- Move auth below the fold or into a modal/overlay triggered by a CTA
- Hero should focus on: instructor face, a video snippet, social proof, or a single powerful transformation promise
- The CTA should be "התחילי עכשיו — שיעור ראשון בחינם" or similar, not an email field

### 6. No Visual Hierarchy in the Feature Grid
**Where:** `index.astro` → `#plans`

**Problem:** Three numbered boxes with identical styling. No icons, no imagery, no size variation. "שיעור תיקון" (live correction class) — your most differentiated feature — looks identical to "חופש מוחלט" (freedom).

**Fix:**
- Make the live class feature larger or more prominent
- Add simple icons or illustrations (even CSS/SVG shapes)
- Consider asymmetric grid: one large feature + two smaller ones
- Add social proof near the feature grid (testimonials, participant counts)

### 7. Missing Hover, Focus, and Active States
**Where:** Global — `Button.svelte`, `global.css`, auth links

**Problem:** Buttons have no hover state. Links have no hover state. The only focus style is `outline: 2px solid var(--sky-strong)` on inputs. This makes the interface feel frozen and unresponsive.

**Fix:**
- Buttons: `transform: translateY(-1px)` + subtle background shift on hover
- Chips: `scale(1.02)` or border-color change on hover
- Links: underline animation or color shift
- Add `:active` states for tactile feedback

### 8. Typography is Too Tight for Hebrew
**Where:** Global CSS

**Problem:** `line-height: 1` and `letter-spacing: -0.05em` on headings. Hebrew script has ascenders/descenders (ל, פ, ש, ק) that crash into each other at tight line-heights. The negative tracking also hurts readability in RTL.

**Fix:**
- Headings: `line-height: 1.1` minimum, preferably `1.15–1.2`
- Remove negative letter-spacing on Hebrew headings, or reduce to `-0.01em` max
- Body: `line-height: 1.6` for comfortable reading (currently 1.5, which is okay but could be better)

### 9. The "Sky" Accent is Underutilized
**Where:** Global tokens

**Problem:** You have a beautiful soft blue (`#9fd8ff`) that appears only on selected chips and active nav items. This is your only emotional color besides beige, and it's hiding.

For a Pilates brand, color psychology matters: blue = calm, trust, breath, sky. Beige = earth, body, warmth. You're only using half the palette.

**Fix:**
- Use sky-blue for primary CTAs (currently they use ink/black)
- Add a subtle sky gradient or sky-tinted section backgrounds
- Consider a sky-colored hover state for cards and buttons
- The `hero__copy` could have a sky-tinted background on the left side to create visual balance against the auth card

### 10. No Loading Skeletons or Placeholders
**Where:** `AppShell.svelte`, `OnboardingShell.svelte`

**Problem:** While Convex loads, users see plain text: "בודק חשבון..." / "טוען אזור אישי...". No visual structure, no sense of progress.

**Fix:**
- Replace text-only loading with a skeleton layout matching the eventual UI
- For the dashboard: show gray boxes in the shape of the sidebar + content area
- Add a subtle pulse animation to skeleton blocks

---

## 🟡 P2 — Polish & Details

### 11. Duplicate Sign-Out Buttons
**Where:** `AppShell.svelte` (header), `Dashboard.svelte` (header)

**Problem:** Two "יציאה" buttons on the same screen. One in the app-top bar, one in the dashboard header.

**Fix:** Remove the one in `Dashboard.svelte`. The app-top bar is the canonical navigation.

### 12. The `clearLocalSession` vs `signOut` Confusion
**Where:** `AppShell.svelte`

**Problem:** Both functions display as "יציאה" but do different things. `clearLocalSession` just wipes localStorage and redirects. `signOut` also hits the Convex API. The user can't tell the difference.

**Fix:** Always use `signOut` for user-facing logout. `clearLocalSession` should be an internal fallback, not a primary action.

### 13. Onboarding Notes Field is a Black Box
**Where:** `OnboardingForm.svelte`

**Problem:** "משהו שחimportant לדעת?" with no examples or guidance. Users don't know what to write.

**Fix:** Add placeholder examples that rotate or are always visible:
> "למשל: כאב גב תחתון, אחרי ניתוח קיסרי, מגבלות ברך, או העדפה לשיעורים קצרים"

### 14. Missing Favicon & Meta Tags
**Where:** `PublicLayout.astro`

**Problem:** No OpenGraph tags, no Twitter cards, no theme-color. The favicon exists in public but no `<link rel="icon">` in the head.

**Fix:** Add OG image, description, theme-color, and proper favicon links.

### 15. The Border-Everywhere Aesthetic Creates Visual Noise
**Where:** Global CSS

**Problem:** `border: 1px solid var(--line)` on virtually every container. This creates a wireframe aesthetic that feels unfinished rather than intentionally minimal.

**Fix:**
- Remove borders from containers that already have background contrast
- Use whitespace (padding/margin) as the primary separator
- Reserve borders for interactive elements (inputs, buttons) and subtle dividers
- Consider using a very subtle box-shadow instead of borders for cards:
  `box-shadow: 0 1px 3px rgba(0,0,0,0.04)`

---

## 🟢 P3 — Nice-to-Have Enhancements

### 16. Add a Welcome Animation
A subtle fade-in or slide-up on the landing page hero. The current page snaps into existence.

### 17. Make the Auth Panel an Overlay/Modal
On mobile especially, the auth card takes up the full hero. A modal triggered by "התחילי עכשיו" would be cleaner.

### 18. Add a "Skip Onboarding" Escape Hatch
Some users want to browse first. Let them skip and complete later via a persistent but non-intrusive banner.

### 19. Profile Data Should Be Editable
Currently it's display-only. Add an "עריכה" button that takes users back to onboarding fields.

### 20. Consider a Colorful Empty State Illustration
For the dashboard pre-launch state, a small SVG illustration of a person doing Pilates would add warmth and brand personality.

---

## Flow Analysis

```
Landing Page (/)
├── Hero with embedded auth ← TOO EARLY
│   └── User enters email
│   └── Magic link sent
│   └── Clicks link → /app (with code)
│       └── AppShell: auth check
│           ├── Not auth → "צריך להתחבר" (dead end, no auto-redirect)
│           ├── Auth, needs onboarding → /onboarding (hard replace)
│           └── Auth, onboarded → Dashboard
│
└── Feature grid (01/02/03) ← NO SOCIAL PROOF, NO CTA

Onboarding (/onboarding)
├── Checks auth ← Good
├── Not auth → "צריך להתחבר" with link to /#auth ← Should auto-redirect
├── Ready → Shows full form (equipment + experience + goals + notes) ← COGNITIVE WALL
└── Submit → hard redirect to /app ← No success celebration

App (/app)
├── Auth check
├── Loading → plain text
├── Not auth → dead end
├── Needs onboarding → redirect
└── Ready → Dashboard with raw profile data + 4 dead nav items
```

### Recommended Flow

```
Landing Page (/)
├── Hero: Video/image + headline + social proof + "התחילי עכשיו" CTA
├── Feature grid (asymmetric, with icons)
├── Testimonials / instructor bio
└── Bottom CTA → opens auth modal

Auth Modal
├── Email input → send code
├── Code input → authenticate
└── Success → redirect to /onboarding

Onboarding (/onboarding) — STEP-BASED
├── Step 1/4: Experience (3 radio buttons) ← 30 seconds
├── Step 2/4: Equipment (chips, with "רק מזרן" quick-select)
├── Step 3/4: Goals (chips)
├── Step 4/4: Notes (optional) + summary preview
└── Submit → success animation → redirect to /app

App (/app) — WELCOME STATE
├── Warm welcome: "ברוכה הבאה! לפי מה שסיפרת, נמליץ על..."
├── Recommended first class (highlighted card)
├── Profile summary (styled card, not raw <dl>)
└── Sidebar with "בקרוב" badges on disabled items
```

---

## Emotional Journey Map

| Stage | Current Emotion | Target Emotion | Gap |
|-------|-----------------|----------------|-----|
| Landing | Confused / skeptical | Curious / hopeful | No visual hook, auth too early |
| Auth | Anxious / uncertain | Safe / trusting | Dev message leaks, no reassurance |
| Onboarding | Overwhelmed | Cared-for / guided | Too many fields at once |
| Dashboard | Disappointed | Excited / ready | Empty state apologizes instead of invites |

---

## Quick Wins (Do This Week)

1. **Remove dev message** from AuthPanel — 1 line change
2. **Add hover states** to buttons and chips — 10 lines of CSS
3. **Fix line-height** on headings — 3 lines of CSS
4. **Style disabled nav items** in Dashboard — add opacity + "בקרוב" badge
5. **Change dashboard welcome copy** from apology to invitation — rewrite 2 sentences
6. **Replace `replace()` with `assign()`** for onboarding→app redirect — 1 line

---

## Strategic Recommendations (Do This Month)

1. **Redesign onboarding as a step wizard** — biggest impact on conversion
2. **Move auth out of hero** — build desire first, capture later
3. **Add imagery/video to landing** — instructor face, class snippet, movement
4. **Build a real dashboard welcome state** — recommended class, not raw data dump
5. **Reduce border usage** — shift to whitespace and subtle shadows
6. **Add loading skeletons** — perceived performance matters

---

## Competitive Reference: Lesly Logan OPC

What Lesly does well that you should emulate:
- **Instructor-forward:** Her face is everywhere. Pilates is personal — the instructor IS the brand.
- **Social proof first:** Testimonials, before/after, community numbers above the fold.
- **Gated content with teaser:** You see what you're missing before you pay.
- **Warm, conversational copy:** "Hey there!" not "Please enter your credentials."
- **Clear transformation promise:** "Go from pain to power" — specific, emotional.
- **Progressive disclosure:** Free resources → email capture → paid offer. Not email capture on page 1.

What to NOT copy:
- Her visual style is very American-marketing (bright, bold, lots of red). Your brand should feel more Israeli, more intimate, more rehabilitation-focused.

---

*End of audit.*
