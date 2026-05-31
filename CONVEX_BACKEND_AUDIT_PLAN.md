# Convex Backend Audit Plan

## Scope

- Audit Convex backend architecture, schema structure, repeated validators/shapes,
  monolithic files, static repeated logic, and guideline risks.
- Do not mutate deployment data, run migrations, deploy, or change backend
  behavior during the audit.

## References

- `AGENTS.md`
- `convex/_generated/ai/guidelines.md`
- `.agents/skills/convex/SKILL.md`
- `.agents/skills/convex-performance-audit/SKILL.md`

## Workstreams

1. Schema/data-model structure and duplicated validators. Done.
2. Backend module architecture, monolithic files, and repeated helpers. Done.
3. Convex correctness/performance guideline risks. Done.
4. Local synthesis into prioritized refactor recommendations. Done.

## Hurdles To Check

- Refactors that require migration-safe rollout because stored documents already
  exist.
- Auth and payment code where public/internal exposure or duplicated status
  handling can create security or fulfillment bugs.
- Query patterns that are acceptable at today's scale but become unbounded as
  content, payments, attendance, or reminders grow.

## Outcome

See `CONVEX_BACKEND_AUDIT.md` for the final findings and staged refactor plan.
