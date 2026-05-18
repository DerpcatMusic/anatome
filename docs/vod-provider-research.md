# HomeBody Premium VOD Research

Last updated: 2026-05-17

## Product Model

HomeBody has three credit products:

- `vod`: one premium recorded video watch costs 1 video credit.
- `live`: one group live RSVP costs 1 live credit.
- `oneOnOne`: one personalized 1:1 live costs 1 one-on-one credit.

Plan configuration later decides how many of each credit a subscriber receives per period. Content itself should not set arbitrary credit prices.

All premium videos must be watched on HomeBody. No public YouTube/Vimeo-style links.

## VOD Requirements

- Premium-only playback.
- Convex checks auth, subscription, active credit bucket, and video entitlement.
- Provider URL/token is generated only after Convex passes checks.
- Short-lived playback tokens or signed URLs.
- A member spends 1 VOD credit to select a weekly video.
- The selected video remains watchable until the earlier of the credit bucket end or the video's weekly expiry.
- Rewatching the same selected video in the same credit bucket does not consume a second credit.
- Unselected videos are locked/grayed out when the member has no remaining VOD credits or lacks required equipment.
- Visible user watermark overlay in the HomeBody player.
- Provider details stay behind a thin Convex/backend adapter.

## Provider Direction

Use Cloudflare Stream for MVP unless Bunny Stream benchmarking shows a major cost win for the real catalog/watch pattern.

Cloudflare Stream reasons:

- Managed upload, encoding, storage, adaptive streaming, delivery, and analytics.
- Simple pricing based on minutes stored and minutes delivered.
- Encoding and bandwidth are included in delivered minutes.
- Strong fit for protected, subscriber-only VOD without building HLS packaging ourselves.
- Same provider can also handle one-way live later if needed.

Bunny Stream reasons to benchmark:

- Often attractive on raw CDN/storage pricing.
- Flexible video CDN platform.
- Could be cheaper at some usage shapes.

Why not self-host on object storage/CDN for MVP:

- HLS packaging, transcoding, adaptive renditions, signed playback, analytics, device quirks, and abuse controls become our responsibility.
- Premium content leakage and support burden matter more than saving a small amount early.

Mux is high quality but likely more expensive/feature-heavy than needed for an Israel-first Pilates MVP.

Sources:

- Cloudflare Stream pricing: https://developers.cloudflare.com/stream/pricing/
- Cloudflare Stream product: https://www.cloudflare.com/developer-platform/products/cloudflare-stream/
- Bunny Stream pricing: https://docs.bunny.net/docs/stream-pricing
- Bunny Stream product pricing: https://bunny.net/pricing/stream/
- Mux pricing: https://www.mux.com/pricing

## Recommended VOD Schema Later

```ts
videos
videoViews
videoPlaybackEvents
```

`videos` stores provider IDs and metadata.

`videoSelections` prevents double-charging a replay inside the same credit period.

`videoPlaybackEvents` records playback-token generation and threshold consumption.

## Recommended Credit Rule

Generate playback token after entitlement check.

Consume 1 `vod` credit when the member selects a weekly video. Store the selected video, user, and exact credit bucket together. Playback later checks that the selection is still active before issuing any provider token.
