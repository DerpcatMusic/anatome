<script lang="ts">
  import { Button, ScrollArea } from "bits-ui";
  import { api } from "$convex/_generated/api";
  import type { Id } from "$convex/_generated/dataModel";
  import { useConvexClient } from "convex-svelte";
  import { authQuery } from "$lib/auth/session.svelte";
  import "./OneOnOneShell.css";

  let {
    onPendingCountChange,
  }: {
    onPendingCountChange?: (count: number) => void;
  } = $props();

  const dayFormatter = new Intl.DateTimeFormat("he-IL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Asia/Jerusalem",
  });
  const timeFormatter = new Intl.DateTimeFormat("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jerusalem",
  });

  const client = useConvexClient();

  let requests = $state<
    {
      _id: Id<"oneOnOneRequests">;
      requestedStartsAt: number;
      requestedEndsAt: number;
      note?: string;
    }[]
  >([]);
  let loading = $state(true);
  let actionId = $state<string | null>(null);
  let actionError = $state("");

  async function loadRequests() {
    loading = true;
    actionError = "";
    try {
      requests = (await authQuery(api.oneOnOne.instructor.listRequests, {})) ?? [];
      onPendingCountChange?.(requests.length);
    } catch (reason) {
      actionError = reason instanceof Error ? reason.message : "לא הצלחנו לטעון בקשות.";
    } finally {
      loading = false;
    }
  }

  async function approveRequest(requestId: Id<"oneOnOneRequests">) {
    actionId = requestId;
    actionError = "";
    try {
      await client.mutation(api.oneOnOne.instructor.approveRequest, { requestId });
      await loadRequests();
    } catch (reason) {
      actionError = reason instanceof Error ? reason.message : "לא הצלחנו לאשר.";
    } finally {
      actionId = null;
    }
  }

  async function rejectRequest(requestId: Id<"oneOnOneRequests">) {
    actionId = requestId;
    actionError = "";
    try {
      await client.mutation(api.oneOnOne.instructor.rejectRequest, { requestId });
      await loadRequests();
    } catch (reason) {
      actionError = reason instanceof Error ? reason.message : "לא הצלחנו לדחות.";
    } finally {
      actionId = null;
    }
  }

  $effect(() => {
    void loadRequests();
  });

  export async function refresh() {
    await loadRequests();
  }
</script>

<div class="requests-panel">
  <p class="requests-panel__intro">
    בקשות מלקוחות לשיעור 1:1 ממתינות לאישור. לאחר אישור נוצר שיעור בלוח הלייב.
  </p>

  {#if actionError}
    <p class="requests-panel__error" role="alert">{actionError}</p>
  {/if}

  <ScrollArea.Root class="requests-scroll" type="auto">
    <ScrollArea.Viewport class="requests-scroll__viewport">
      <div class="requests-scroll__content">
        {#if loading}
          <p class="requests-panel__loading">טוען בקשות...</p>
        {:else if requests.length === 0}
          <div class="empty-state">
            <span class="material-symbols-rounded empty-icon">inbox</span>
            <p>אין בקשות ממתינות כרגע.</p>
            <p class="empty-hint">כאשר לקוחה תבקש שיעור 1:1, הבקשה תופיע כאן.</p>
          </div>
        {:else}
          <div class="request-list">
            {#each requests as request (request._id)}
              <article class="request-card">
                <div class="request-header">
                  <strong>{dayFormatter.format(new Date(request.requestedStartsAt))}</strong>
                  <span class="request-time">
                    {timeFormatter.format(new Date(request.requestedStartsAt))} –
                    {timeFormatter.format(new Date(request.requestedEndsAt))}
                  </span>
                </div>
                {#if request.note}
                  <p class="request-note">{request.note}</p>
                {/if}
                <div class="request-actions">
                  <Button.Root
                    class="hb-button hb-button--ink hb-button--sm"
                    type="button"
                    onclick={() => approveRequest(request._id)}
                    disabled={actionId === request._id}
                  >
                    אישור
                  </Button.Root>
                  <Button.Root
                    class="hb-button hb-button--paper hb-button--sm"
                    type="button"
                    onclick={() => rejectRequest(request._id)}
                    disabled={actionId === request._id}
                  >
                    דחייה
                  </Button.Root>
                </div>
              </article>
            {/each}
          </div>
        {/if}
      </div>
    </ScrollArea.Viewport>
    <ScrollArea.Scrollbar orientation="vertical" class="requests-scroll__bar" />
  </ScrollArea.Root>
</div>

<style>
  .requests-panel__intro {
    margin: 0 0 var(--space-3);
    font-size: var(--step--1);
    color: var(--muted);
    line-height: 1.4;
  }

  .requests-panel__error {
    margin: 0 0 var(--space-3);
    color: var(--danger-text);
    font-weight: 700;
    font-size: var(--step--1);
  }

  .requests-panel__loading {
    margin: 0;
    color: var(--muted);
  }

  :global(.requests-scroll) {
    max-height: min(52vh, 480px);
    width: 100%;
  }

  :global(.requests-scroll__viewport) {
    max-height: min(52vh, 480px);
  }

  :global(.requests-scroll__content) {
    padding-inline-end: var(--space-2);
  }

  :global(.requests-scroll__bar) {
    width: 6px;
    padding: 2px;
  }
</style>
