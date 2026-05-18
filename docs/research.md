# HomeBody Research Notes

Last updated: 2026-05-16

## Convex Auth

Implemented with `@convex-dev/auth` and the Password provider.

Notes:

- Official Convex Auth React helpers are React-first.
- In this Astro + Svelte app, Svelte calls the generated Convex Auth actions directly.
- Tokens are stored in local storage and passed to `ConvexClient.setAuth`.
- Server-side authorization still derives the user from Convex Auth using `getAuthUserId`.

Source:

- https://docs.convex.dev/auth/convex-auth

## Convex Components To Consider

Do not add all components now. Add only when a product feature needs them.

Recommended later:

- `@convex-dev/rate-limiter`: protect token generation, RSVP spam, upload actions, and suspicious playback access.
- Workflow component: durable payment/video processing if Cloudflare/Grow webhooks need retries and multi-step processing.
- Aggregate component: counters for video views, credit usage, attendance, and revenue dashboards.
- Migrations component: structured data migrations after schema stabilizes.

Avoid for now:

- Convex Ents. It is useful for relationship-heavy apps but appears maintenance-mode and adds abstraction before we need it.
- Agent/AI components. HomeBody does not need AI infrastructure for MVP.

Sources:

- https://docs.convex.dev/components/understanding
- https://docs.convex.dev/agents/rate-limiting
- https://docs.convex.dev/scheduling
- https://stack.convex.dev/ents

## Pilates Onboarding

The first onboarding should be short. Its purpose is not marketing; it protects paid access quality and helps recommend safe classes.

Ask:

- Equipment available: mat, reformer, cadillac, chair, barrel, magic circle, ball, band, light weights.
- Experience level: new, some, steady.
- Goals: strength, mobility, posture, back care, return to movement.
- Safety notes: injuries, pregnancy/postpartum, pain, limitations, preferences.

Do not ask too much before users see value.

Sources:

- Online Pilates Classes examples mention mat/reformer and Magic Circle equipment needs: https://onlinepilatesclasses.com/
- Reformer Works emphasizes injuries, health conditions, pregnancy, safe environment, and camera setup for online classes: https://reformer.works/online-reformer-classes-membership-faqs/
- Pilates studio class descriptions commonly separate mat, reformer, experience, and injury readiness: https://www.coastlinepilates.com/class-levels-and-descriptions

## Security Notes

Paid dashboard rules:

- Never accept `userId` from the client for entitlement/onboarding ownership.
- Always derive user identity server-side.
- Keep onboarding mutation idempotent: insert once, patch after.
- Rate-limit payment/video/live token endpoints before launch.
- Audit security-sensitive actions once paid content exists.
