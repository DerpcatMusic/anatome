# Convex Backend Refactor Plan

Date: 2026-05-31

## Constraints

- Do not deploy, migrate production data, delete runtime records, or run
  destructive operations.
- Keep behavior compatible with existing stored documents.
- Work only in Convex backend files needed for the audited refactors.

## Steps

1. Shared validators and schema reuse: done.
   - Extract reusable domain validators.
   - Extract shared order/CardCom field validators.
   - Add the missing video admin compound index.

2. Correctness/performance fixes: done.
   - Query video admin pages by instructor + status directly.
   - Batch video cleanup child deletions.
   - Bound roster row reads.

3. Payment refactor: done.
   - Consolidate CardCom low-profile creation.
   - Keep subscription and credit actions thin.
   - Centralize checkout CSS selection.

4. Live/backend architecture: done.
   - Extract live manager authorization and lifecycle helpers.
   - Reuse one roster row-loading path.
   - Consolidate 1:1 live-class creation.

5. Singleton and billing helpers: done.
   - Add nullable app profile lookup helper.
   - Add singleton-by-user duplicate checks for critical records.
   - Consolidate subscription plan lookup and self-serve billing guards.

6. Verification: done.
   - Run focused tests where available.
   - Run `bun run check`.
