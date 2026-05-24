# Video System Design — HomeBody

## Problem Statement

- Instructors currently CANNOT upload videos. The `videos` table is manually populated.
- The `/videos` page shows a **customer credit selection UI** to everyone — instructors see "video credits" which makes no sense for them.
- We need a role-based video experience:
  - **Instructors/Admins**: Upload, manage, publish/archived videos
  - **Customers**: Browse available videos, select with weekly credits, watch selected ones

## Architecture Decision

### Video Hosting: Cloudflare Stream (recommended)

**Why Cloudflare Stream over Convex storage or Bunny:**

| Feature | Convex Storage | Bunny Stream | Cloudflare Stream |
|---------|---------------|--------------|-------------------|
| Upload size limit | None (2min timeout) | 5GB | 5TB |
| Resumable upload | No | Limited | TUS protocol (built-in) |
| Auto-encoding | No | Yes | Yes (HLS/DASH auto) |
| Auto-thumbnails | No | Yes | Yes |
| Signed URLs | No | Yes | Yes |
| Webhook on ready | No | Yes | Yes |
| Global CDN | No | Yes | Yes (250+ cities) |
| API maturity | Blob storage | Good | Excellent |
| Price | Included | $0.01/GB/mo | $1/1000min stored |

**Cloudflare Stream is the clear winner** for fitness video because:
1. TUS resumable uploads = reliable upload from instructors' homes
2. Auto-generates thumbnails, HLS playlists, multiple qualities
3. Webhook fires when processing completes → we update Convex
4. Signed URLs prevent hotlinking
5. Handles 4K, adaptive bitrate, works globally

## Upload Flow

```
Instructor selects file in browser
  → Svelte calls convex.mutation(api.videos.requestUpload, { title, description, equipment })
    → Convex creates video row with status="uploading"
    → Convex calls Cloudflare Stream API to create Direct Creator Upload URL
      → Returns { uploadUrl, videoUID } to client
  → Browser POSTs file directly to Cloudflare (TUS for large files)
    → Progress tracked in Svelte $state
  → Cloudflare webhook fires when ready
    → convex.action(api.videos.handleWebhook, { uid, status, duration, thumbnail, playbackUrl })
      → Updates video row: providerVideoId=uid, status="published", durationSeconds, thumbnailUrl
```

## Schema Additions

```typescript
// videos table already exists — we use it as-is but change how rows are created

// Add upload sessions for tracking in-progress uploads
videoUploadSessions: defineTable({
  videoId: v.id("videos"),
  instructorUserId: v.id("users"),
  cloudflareUID: v.string(),
  status: v.union(v.literal("uploading"), v.literal("processing"), v.literal("ready"), v.literal("failed")),
  progressPercent: v.number(), // 0-100
  errorMessage: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("by_videoId", ["videoId"])
 .index("by_instructorUserId", ["instructorUserId"]),
```

## Convex API Design

### `videos.requestUpload` (mutation)
- Auth: instructor/admin only
- Creates `videos` row with status="draft" and `videoUploadSessions` row
- Calls Cloudflare Stream API to get Direct Creator Upload URL
- Returns `{ uploadUrl, videoId }`

### `videos.handleWebhook` (action)
- Called by Cloudflare webhook
- Updates video metadata (duration, thumbnail, playback URL)
- Sets status="published"

### `videos.listForInstructors` (query)
- All videos by instructor, with status filter
- No credit logic

### `videos.listWeekly` (query) — existing, unchanged
- Customer-facing with credit selection logic

### `videos.updateMetadata` (mutation)
- Edit title, description, equipment, availableFrom/Until

### `videos.setStatus` (mutation)
- instructor/admin: publish, archive, draft

### `videos.delete` (mutation)
- Soft delete + optionally delete from Cloudflare

## Svelte Component Architecture

### Role-based routing in `/videos` page

```svelte
{#if isStaff}
  <InstructorVideoManager />
{:else}
  <CustomerVideoSelector />
{/if}
```

### `InstructorVideoManager.svelte`

Two views:
1. **Upload tab**: Drag-drop zone, file picker, progress bar, metadata form
2. **Library tab**: Grid of all videos with status badges, edit modal

### Upload component (TUS)

```typescript
import * as tus from "tus-js-client";

let uploadProgress = $state(0);
let uploadStatus = $state<"idle" | "uploading" | "processing" | "ready" | "error">("idle");

async function startUpload(file: File, uploadUrl: string) {
  const upload = new tus.Upload(file, {
    endpoint: uploadUrl,
    retryDelays: [0, 3000, 5000, 10000],
    metadata: { name: file.name, filetype: file.type },
    onProgress: (bytesUploaded, bytesTotal) => {
      uploadProgress = Math.round((bytesUploaded / bytesTotal) * 100);
    },
    onSuccess: () => { uploadStatus = "processing"; },
    onError: (err) => { uploadStatus = "error"; },
  });
  upload.start();
}
```

### Cloudflare Stream Webhook Setup

In Cloudflare dashboard:
1. Go to Stream → Webhooks
2. Add webhook URL: `https://<your-convex-site>.convex.site/mux/webhook`
3. Convex HTTP action receives the webhook:

```typescript
// convex/http.ts
http.route({
  path: "/mux/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    // body.uid, body.status, body.duration, body.thumbnail, body.playback.hls
    await ctx.runAction(api.videos.handleWebhook, {
      cloudflareUID: body.uid,
      status: body.status, // "ready" | "error"
      durationSeconds: body.duration,
      thumbnailUrl: body.thumbnail,
      playbackUrl: body.playback?.hls,
    });
    return new Response("OK");
  }),
});
```

## Credit System Separation

**Customers**: Keep existing `listWeekly` + `selectForWeek` + credit bucket logic.

**Instructors**: 
- No credit consumption
- See ALL videos (their own + all published)
- Can upload new ones
- Can edit metadata, change status, delete

## Implementation Priority

1. **P0**: Role-based `/videos` page split (instructor vs customer UI)
2. **P0**: `videos.listForInstructors` query + `InstructorVideoManager` component
3. **P1**: Cloudflare Stream Direct Creator Upload API integration
4. **P1**: TUS upload component with progress
5. **P2**: Webhook handler for processing completion
6. **P2**: Video metadata editor
