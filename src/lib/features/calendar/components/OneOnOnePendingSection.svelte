<script lang="ts">
  import { Button } from "bits-ui";
  import type { Id } from "$convex/_generated/dataModel";

  interface Props {
    showOneOnOneRequest: boolean;
    pendingRequests: Array<{ _id: Id<"oneOnOneRequests">; requestedStartsAt: number }>;
    actionId: string | null;
    onCancelRequest: (requestId: Id<"oneOnOneRequests">) => void;
  }

  let {
    showOneOnOneRequest,
    pendingRequests,
    actionId,
    onCancelRequest,
  }: Props = $props();

  const slotDateFormatter = new Intl.DateTimeFormat("he-IL", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jerusalem",
  });

  const makeCancelOneOnOneRequestHandler = (requestId: Id<"oneOnOneRequests">) => () => {
    onCancelRequest(requestId);
  };
</script>

{#if showOneOnOneRequest && pendingRequests.length > 0}
  <div class="one-on-one-pending" role="region" aria-labelledby="one-on-one-pending-heading">
    <div class="one-on-one-pending__banner">
      <span class="material-symbols-rounded one-on-one-pending__icon" aria-hidden="true"
        >hourglass_top</span
      >
      <div class="one-on-one-pending__summary">
        <h3 id="one-on-one-pending-heading" class="one-on-one-pending__title">
          {pendingRequests.length}
          {pendingRequests.length === 1 ? "בקשה ממתינה" : "בקשות ממתינות"}
        </h3>
      </div>
    </div>
    <ul class="one-on-one-pending__list">
      {#each pendingRequests as request (request._id)}
        <li class="one-on-one-pending__row">
          <time datetime={new Date(request.requestedStartsAt).toISOString()}>
            {slotDateFormatter.format(new Date(request.requestedStartsAt))}
          </time>
          <Button.Root
            class="hb-button hb-button--paper hb-button--sm"
            type="button"
            onclick={makeCancelOneOnOneRequestHandler(request._id)}
            disabled={actionId === request._id}
          >
            {actionId === request._id ? "מבטלת..." : "ביטול"}
          </Button.Root>
        </li>
      {/each}
    </ul>
  </div>
{/if}

<style>
  .one-on-one-pending {
    border: var(--border);
    border-radius: var(--radius-md);
    background: var(--elevated);
    overflow: hidden;
  }

  .one-on-one-pending__banner {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    background: var(--accent-soft);
    border-bottom: 1px solid var(--line-light);
  }

  .one-on-one-pending__icon {
    color: var(--primary);
    font-size: 1.25rem;
  }

  .one-on-one-pending__title {
    margin: 0;
    font-size: var(--step-0);
    font-weight: 800;
  }

  .one-on-one-pending__list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .one-on-one-pending__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border-bottom: 1px solid var(--line-light);
    font-family: var(--font-body);
    font-variant-numeric: tabular-nums;
    font-size: var(--step--1);
    font-weight: 700;
  }

  .one-on-one-pending__row:last-child {
    border-bottom: none;
  }
</style>
