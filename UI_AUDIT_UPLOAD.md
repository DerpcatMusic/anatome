# UI Audit: Video Upload Flow — Brutal Honesty Edition

## Executive Summary

The upload UI is not "a bit rough." It is a textbook example of **feature-creep-induced cognitive overload**. You took every possible requirement — file handling, metadata entry, business model selection, taxonomy management, encoding configuration, and progress tracking — and crammed them into a single panel. Then you wrapped it in a toggle that slides down from a toolbar, as if hiding the chaos behind a button makes it less chaotic.

An instructor opening this panel is hit with **7 distinct decision domains** before they can upload a single file. That is not a workflow. That is a configuration wizard disguised as a form.

---

## 1. Everything Happens at Once (No Progressive Disclosure)

**Problem:** The form presents all fields simultaneously: file drop, title, description, access model, categories, equipment, and advanced encoding settings. There is no sequencing, no stepper, no "first things first."

**Why it matters:** Human working memory can hold roughly 4 items. Your form asks for decisions across 7+ domains in one glance. The instructor's brain does not know where to start.

**What it should be:**
- **Step 1:** Drop/select file. Just the file. Nothing else.
- **Step 2:** While the file uploads (or immediately after), show metadata fields.
- **Step 3:** A single "Publish" or "Save as Draft" action.

Or, if you truly want a single-page flow: **group and sequence visually**. File first (large, dominant), metadata second (clear section), settings third (collapsed by default, or moved elsewhere entirely).

---

## 2. The "Processing" State Is a Lie

**Problem:** After upload completes, the form shows a spinner with the text:
> "הקובץ הועלה בהצלחה. מעבדים בשרתי Mux..."

Then **1.5 seconds later**, the panel auto-collapses and a notice appears at the top:
> "יופיע בספריה תוך כמה דקות"

**Why it matters:** You are telling the user two contradictory things. First: "we are processing right now." Then: "actually, this takes a few minutes." The form collapses before the actual work is done. The user is left with a success message that implies completion, but the video is not actually ready.

**What it should be:** Be honest about asynchronicity.
- If the upload is done but processing is not: "הקובץ הועלה. השיעור יהיה זמין לאחר עיבוד (~2–5 דקות)."
- Do NOT collapse the form. Show the video in the list below with a "מעבד..." status badge.
- Let the user dismiss the form themselves, or keep it open until they click "סיום."

---

## 3. Category Creation Should Not Be Inside the Upload Flow

**Problem:** You embedded a full category CRUD interface inside the upload form: a grid of toggleable category pills, a count badge, a "no categories" notice, and an inline "new category" input with a button.

**Why it matters:** Category management is a **taxonomy admin task**. Uploading a video is a **content creation task**. These are different mental models, different frequencies (you create categories rarely, upload videos often), and different user permissions. By combining them, you force every upload to carry the weight of the category system.

**What it should be:** Categories should be managed in a separate settings page or modal. The upload form should show a simple multi-select dropdown of existing categories — nothing more. If no categories exist, show a single line: "אין קטגוריות. <a>צרי קטגוריה חדשה</a>" that opens a separate flow.

---

## 4. Advanced Encoding Settings Should Be Invisible to Instructors

**Problem:** The collapsible "הגדרות קידוד מתקדמות (Mux)" exposes three technical decisions:
- Video quality (basic/plus/premium)
- Max resolution (1080p/1440p/4K)
- Static MP4 rendition (none/audio/720p/1080p)

**Why it matters:** Instructors are fitness professionals, not video engineers. They do not know what "static rendition" means. They do not know when to pick "Plus" vs "Premium." These are platform-level defaults that should be set once by an admin, not chosen per-upload by an instructor.

**What it should be:** Remove this section entirely. Set sensible defaults (`plus`, `1080p`, `none`) in the backend. If an instructor truly needs different settings, that is a rare edge case handled by support — not a UI option.

---

## 5. "Macroflow" vs "Microflow" Is Internal Jargon

**Problem:** The access model selector presents two product terms the user had to learn:
> Macroflow — "רכישה חד-פעמית וגישה קבועה ללקוחה."  
> Microflow — "פתוח למנויות פעילות בלבד, בלי צריכת קרדיט."

**Why it matters:** These terms mean nothing to a new instructor. The descriptions help, but they add yet another decision to an already overwhelming form. And the reality is: most instructors will always pick the same option. You're asking them to configure the business model of their video every single time.

**What it should be:** Set a default (probably Macroflow for standalone videos) and move this to a per-video setting in an edit modal — not the upload flow. Or, if it truly varies per video, use plain language:
> ○ רכישה חד-פעמית (הלקוחה שומרת גישה לתמיד)  
> ○ מנוי בלבד (זמין רק למנויות פעילות)

Better yet: default to Macroflow and let them change it later in the video settings.

---

## 6. The File Preview Is Overkill

**Problem:** After selecting a file, the form renders a full `<video>` element with controls, a close button, and a metadata bar showing file name, size, and duration.

**Why it matters:** This is an upload form, not a media player. The instructor already knows what file they selected. A full video player consumes vertical space, adds DOM weight, and distracts from the actual task: filling metadata and submitting.

**What it should be:** A compact "file chip":
> 📄 `reformer-basics.mp4` · 120 MB · 45:00 · [×]

One line. No player. No controls. Just confirmation that the right file was selected.

---

## 7. Inline Validation Is Nonexistent

**Problem:** The `canSubmit` derived value disables the submit button when requirements aren't met (file missing, title too short, no categories). But there is **no visual feedback** on which fields are invalid. The button just goes gray.

**Why it matters:** The user has to guess what they did wrong. Is the title too short? Did they forget categories? Is the file missing? The form gives them zero guidance.

**What it should be:**
- Red border + inline error text on fields that fail validation.
- "נדרשת לפחות קטגוריה אחת" directly under the categories section if none selected.
- "הכותרת חייבת להכיל לפחות 3 תווים" under the title field if too short.
- The submit button should NEVER be the only source of validation feedback.

---

## 8. Error Display Is a Mess

**Problem:**
```svelte
{#if uploadStatus === "error" || fileError || categoryError}
  <Notice tone="danger">{uploadError || fileError || categoryError}</Notice>
{/if}
```

All errors — upload failures, file validation, category creation — collapse into a single notice at the top of the form. Only the first error is shown. The notice is far from the field that caused it.

**Why it matters:** If the user sees "הקובץ גדול מ-2GB" at the top of the form, they have to visually hunt for the file drop zone to fix it. If both a file error and a category error exist, they never see the category error.

**What it should be:** Errors live next to their fields. Upload errors can go near the submit button. File errors go in/under the file drop zone. Category errors go in the categories section.

---

## 9. The Form Collapses on Success Without User Consent

**Problem:**
```javascript
setTimeout(() => {
  if (uploadStatus === "processing") {
    uploadStatus = "ready";
    showUpload = false;  // ← form collapses automatically
    uploadProgress = 0;
  }
}, 1500);
```

**Why it matters:** The user might have been reading the success message, or they might have noticed a typo in the title and wanted to fix it. The form rips itself away after 1.5 seconds without asking. This is hostile UX.

**What it should be:** Never auto-collapse a form on success. Show a clear success state WITHIN the form:
> ✅ השיעור הועלה בהצלחה!  
> הוא יהיה זמין בספריה תוך 2–5 דקות.
>
> [העלאת שיעור נוסף]

Let the user click to dismiss or start a new upload.

---

## 10. Two Buttons, Equal Visual Weight

**Problem:** The submit action row shows:
```
[ביטול]    [העלאה לספריה]
```

Both are styled as buttons. The cancel button uses `hb-button--paper` which is still a solid, clickable-looking button. In many design systems, "paper" is a secondary style, but here it competes for attention.

**Why it matters:** The primary action (upload) should dominate. The secondary action (cancel) should be visually subordinate — perhaps a text link or a ghost button.

**What it should be:**
```
[ביטול] ← text-only link, subtle gray  
[העלאה לספריה] ← full primary button, prominent
```

Or even: put Cancel as a small "×" in the corner of the panel, and keep only the submit button at the bottom.

---

## 11. State Ownership Is Confused Between Parent and Child

**Problem:**
- `InstructorVideoManager` owns `muxUploader` (the hidden web component ref).
- `VideoUploadForm` owns all form fields (title, description, categories, etc.).
- `uploadStatus` is passed from parent → child as a prop, but the child resets its own internal fields via `$effect` when `uploadStatus === "ready"`.
- The parent sets `uploadStatus = "processing"` in the success handler, but the child has no say in when the form closes.

**Why it matters:** The boundary of responsibility is fuzzy. The child knows it should reset on success, but the parent decides when to hide the form. This leads to race conditions (child resets while parent is collapsing) and makes the flow hard to reason about.

**What it should be:** Either the parent owns ALL upload state (including the form fields), or the child owns the entire upload flow and emits a single `onComplete` event. The current split-brain approach is brittle.

---

## 12. The Description Field Is Given Too Much Real Estate

**Problem:** The description is a full-width textarea with autosize, max 500 chars, and a placeholder. It sits directly below the title with equal visual weight.

**Why it matters:** For an upload flow, the title is critical. The description is nice-to-have. By giving them equal weight, you slow down the user. They feel compelled to write a good description before uploading.

**What it should be:** Description should be smaller, possibly collapsed, or moved to an "edit details" step after upload. The primary upload flow should be: file → title → category → done. Description can be added later.

---

## 13. Orphaned Draft Risk

**Problem:** The `requestUpload` action creates a `videos` row in "draft" status BEFORE the file is uploaded. If the user cancels or the upload fails, the draft row persists.

**Why it matters:** You accumulate ghost draft videos. The `videoUploads` bridge table was deleted in the migration, so there's no longer a link between the upload and the video if something goes wrong mid-upload.

**What it should be:** Create the video row ONLY after successful upload, OR implement a cleanup mechanism for orphaned drafts. Or: keep the video row creation at the start (it's fine for reserving the ID), but show orphaned drafts in the instructor's library with a "העלאה לא הושלמה" badge and a delete option.

---

## 14. Equipment Picker Is Undefined Context

**Problem:** The form includes `EquipmentPicker` but I don't know what it looks like. If it's a multi-select of fitness equipment (mat, reformer, weights, etc.), it's yet another choice in an overloaded form.

**Why it matters:** Every additional field increases cognitive load and drop-off rate. Is equipment selection truly critical at upload time? Can it be added later when the instructor is polishing the video details?

**What it should be:** Move to post-upload editing, or reduce to a simple set of toggle chips with strong defaults (e.g., "mat" pre-selected).

---

## 15. RTL Layout Bugs

**Problem:** The CSS has `direction: rtl` on the container, but individual components may not handle it correctly:
- `.count-badge` uses `margin-right: auto` to push left, but in RTL this is wrong.
- `.preview-meta` has `direction: rtl` explicitly, which may conflict with parent.
- `.clear-file` is `position: absolute; top: ...; left: ...` — in RTL, the close button should probably be on the right edge.

**Why it matters:** These are paper cuts, but they add to the overall sense of "this UI is not polished."

---

## Summary: The Core Problem

You are treating the upload flow as a **database entry form**. Every column in your `videos` table has a corresponding field in the UI. That is not how humans work.

**The upload flow should be:**
1. **Drop file** (one big, inviting zone)
2. **Confirm** (file name, size — compact, dismissible)
3. **Title + category** (the two things that matter most)
4. **Upload happens**
5. **Success** (clear confirmation, video appears in list with "processing" badge)
6. **Edit details later** (description, equipment, access model, thumbnail — all in an edit modal)

Everything else is configuration that can be set once as defaults, or edited after upload.

---

## Recommended Redesign (High Level)

### Option A: Minimal Upload (Preferred)

```
┌─────────────────────────────────┐
│  📁  גררי קובץ וידאו לכאן      │  ← Big, dominant
│      או לחצי לבחירה            │
└─────────────────────────────────┘

[reformer-basics.mp4] [×]         ← Compact file chip

כותרת השיעור *                    ← Single required field
[___________________________]

קטגוריות *                        ← Multi-select dropdown
[בחירת קטגוריות ▼]

        [העלאה לספריה]            ← Primary action
```

**Done.** File uploads. While uploading, instructor sees progress. When done, form shows success and offers "העלאת שיעור נוסף" or "סגירה." The video appears in the list below with a "מעבד..." badge. The instructor can click "ערוך" to set description, equipment, access model, etc.

### Option B: Step Wizard

If you absolutely must collect more at upload time:

1. **File** — drop zone only
2. **Metadata** — title + category (required), description (optional, collapsed)
3. **Settings** — access model (defaulted), equipment (defaulted)
4. **Review** — summary + upload button

---

## What to Delete Immediately

1. Inline category creation from upload form
2. Advanced encoding settings section entirely
3. Video preview player (replace with file chip)
4. Auto-collapse on success
5. The `processing` → `ready` fake transition after 1.5s

## What to Add

1. Inline validation with field-level error messages
2. A "processing" status badge on the video in the list (not in the form)
3. A proper edit modal for post-upload metadata
4. Sensible defaults for access model, quality, equipment
