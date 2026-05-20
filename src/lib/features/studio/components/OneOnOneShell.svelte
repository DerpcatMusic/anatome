<script lang="ts">
  import Button from "$components/ui/Button.svelte";
  import { resource } from "runed";
  import { api } from "$convex/_generated/api";
  import type { Id } from "$convex/_generated/dataModel";
  import { authQuery, initAuth } from "$lib/auth/session.svelte";
  import { useQuery, useConvexClient } from "convex-svelte";
  import PageShell from "$features/app/components/PageShell.svelte";
  import Notice from "$components/ui/Notice.svelte";
  import Select from "$components/ui/Select.svelte";

  const auth = initAuth();
  const profileQuery = useQuery(api.appProfiles.viewer, () => auth.isAuthenticated ? {} : "skip");
  const role = $derived(profileQuery.data?.role ?? "customer");
  const isStaff = $derived(role === "instructor" || role === "admin");

  const range = $derived.by(() => {
    const from = Date.now();
    const to = from + 14 * 24 * 60 * 60 * 1000;
    return { from, to };
  });

  const slotsResource = resource(
    () => auth.isAuthenticated && !isStaff,
    async (enabled) => {
      if (!enabled) return [];
      return await authQuery(api.customerOneOnOne.listAvailableSlots, range);
    }
  );

  const mineResource = resource(
    () => auth.isAuthenticated && !isStaff,
    async (enabled) => {
      if (!enabled) return [];
      return await authQuery(api.customerOneOnOne.listMine, {});
    }
  );

  const requestsResource = resource(
    () => auth.isAuthenticated && isStaff,
    async (enabled) => {
      if (!enabled) return [];
      return await authQuery(api.instructorOneOnOne.listRequests, {});
    }
  );

  const availabilityResource = resource(
    () => auth.isAuthenticated && isStaff,
    async (enabled) => {
      if (!enabled) return [];
      return await authQuery(api.instructorOneOnOne.listAvailability, {});
    }
  );

  const dateFormatter = new Intl.DateTimeFormat("he-IL", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jerusalem",
  });

  let actionId = $state<string | null>(null);
  let actionError = $state("");
  let note = $state("");
  let weekday = $state(0);
  let startHour = $state(9);
  let endHour = $state(12);
  let slotMinutes = $state(50);
  let bufferMinutes = $state(10);
  const weekdayOptions = [
    { value: 0, label: "ראשון" },
    { value: 1, label: "שני" },
    { value: 2, label: "שלישי" },
    { value: 3, label: "רביעי" },
    { value: 4, label: "חמישי" },
    { value: 5, label: "שישי" },
    { value: 6, label: "שבת" },
  ];

  const client = useConvexClient();

  async function requestSlot(slot: { instructorUserId: Id<"users">; startsAt: number; endsAt: number }) {
    actionId = String(slot.startsAt);
    actionError = "";
    try {
      await client.mutation(api.customerOneOnOne.requestSlot, { ...slot, note });
      note = "";
      await Promise.all([slotsResource.refetch(), mineResource.refetch()]);
    } catch (reason) {
      actionError = reason instanceof Error ? reason.message : "לא הצלחנו לשלוח בקשה.";
    } finally {
      actionId = null;
    }
  }

  async function cancelRequest(requestId: Id<"oneOnOneRequests">) {
    actionId = requestId;
    actionError = "";
    try {
      await client.mutation(api.customerOneOnOne.cancelRequest, { requestId });
      await mineResource.refetch();
    } catch (reason) {
      actionError = reason instanceof Error ? reason.message : "לא הצלחנו לבטל.";
    } finally {
      actionId = null;
    }
  }

  async function approveRequest(requestId: Id<"oneOnOneRequests">) {
    actionId = requestId;
    actionError = "";
    try {
      await client.mutation(api.instructorOneOnOne.approveRequest, { requestId });
      await requestsResource.refetch();
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
      await client.mutation(api.instructorOneOnOne.rejectRequest, { requestId });
      await requestsResource.refetch();
    } catch (reason) {
      actionError = reason instanceof Error ? reason.message : "לא הצלחנו לדחות.";
    } finally {
      actionId = null;
    }
  }

  async function saveAvailability() {
    actionId = "availability";
    actionError = "";
    try {
      await client.mutation(api.instructorOneOnOne.setAvailabilityRule, {
        weekday,
        startMinute: startHour * 60,
        endMinute: endHour * 60,
        slotMinutes,
        bufferMinutes,
        isActive: true,
      });
      await availabilityResource.refetch();
    } catch (reason) {
      actionError = reason instanceof Error ? reason.message : "לא הצלחנו לשמור זמינות.";
    } finally {
      actionId = null;
    }
  }

  function formatHour(value: number) {
    return `${String(value).padStart(2, "0")}:00`;
  }
</script>

<PageShell
  kicker={isStaff ? "HomeBody Studio" : "HomeBody 1:1"}
  title={isStaff ? "ניהול 1:1 אישי" : "בקשת שיעור 1:1"}
  description={isStaff ? "קביעת זמינות ואישור בקשות לשיעורים אישיים." : "בחרי חלון פנוי, שלחי בקשה, והמדריכה תאשר ותפתח חדר לייב אישי."}
  loading={isStaff ? requestsResource.loading : slotsResource.loading}
  error={actionError || null}
>
  {#if !auth.isAuthenticated}
    <div class="state-card">
      <p>צריך להתחבר כדי להשתמש ב-1:1.</p>
      <a class="button-link" href="/">כניסה</a>
    </div>
  {:else if isStaff}
    <div class="one-grid">
      <section class="panel">
        <h2>זמינות</h2>
        <div class="form-grid">
          <Select label="יום" bind:value={weekday} options={weekdayOptions} compact />
          <label><span>התחלה</span><input type="number" min="0" max="23" bind:value={startHour} /></label>
          <label><span>סיום</span><input type="number" min="1" max="24" bind:value={endHour} /></label>
          <label><span>משך</span><input type="number" min="20" max="120" bind:value={slotMinutes} /></label>
          <label><span>מרווח</span><input type="number" min="0" max="60" bind:value={bufferMinutes} /></label>
        </div>
        <Button tone="ink" onclick={saveAvailability} disabled={actionId === "availability"}>שמירת זמינות</Button>

        <div class="compact-list">
          {#each availabilityResource.current ?? [] as rule}
            <div class="compact-row">
              <span>יום {rule.weekday}</span>
              <span>{formatHour(Math.floor(rule.startMinute / 60))}-{formatHour(Math.floor(rule.endMinute / 60))}</span>
            </div>
          {/each}
        </div>
      </section>

      <section class="panel">
        <h2>בקשות ממתינות</h2>
        {#if (requestsResource.current ?? []).length === 0}
          <p class="muted">אין בקשות ממתינות.</p>
        {:else}
          <div class="card-list">
            {#each requestsResource.current ?? [] as request}
              <article class="request-card">
                <h3>{dateFormatter.format(new Date(request.requestedStartsAt))}</h3>
                <p>{request.note || "ללא הערה"}</p>
                <div class="actions">
                  <Button tone="paper" onclick={() => approveRequest(request._id)} disabled={actionId === request._id}>אישור</Button>
                  <Button tone="danger" onclick={() => rejectRequest(request._id)} disabled={actionId === request._id}>דחייה</Button>
                </div>
              </article>
            {/each}
          </div>
        {/if}
      </section>
    </div>
  {:else}
    {#if slotsResource.error}<Notice tone="danger">{slotsResource.error.message}</Notice>{/if}
    <label class="note-field">
      <span>הערה למדריכה</span>
      <textarea bind:value={note} maxlength="500" rows="3" placeholder="מטרות, מגבלות, או משהו שכדאי לדעת"></textarea>
    </label>

    <div class="one-grid">
      <section class="panel">
        <h2>חלונות פנויים</h2>
        {#if (slotsResource.current ?? []).length === 0}
          <p class="muted">אין חלונות פנויים בשבועיים הקרובים.</p>
        {:else}
          <div class="card-list">
            {#each slotsResource.current ?? [] as slot}
              <article class="request-card">
                <h3>{dateFormatter.format(new Date(slot.startsAt))}</h3>
                <p>{slot.availableCredits > 0 ? "יש קרדיט 1:1 זמין" : "אין קרדיט 1:1 זמין"}</p>
                <Button tone="ink" onclick={() => requestSlot(slot)} disabled={slot.availableCredits <= 0 || actionId === String(slot.startsAt)}>
                  לשלוח בקשה
                </Button>
              </article>
            {/each}
          </div>
        {/if}
      </section>

      <section class="panel">
        <h2>הבקשות שלי</h2>
        {#if (mineResource.current ?? []).length === 0}
          <p class="muted">אין עדיין בקשות.</p>
        {:else}
          <div class="card-list">
            {#each mineResource.current ?? [] as request}
              <article class="request-card">
                <h3>{dateFormatter.format(new Date(request.requestedStartsAt))}</h3>
                <p>{request.status}</p>
                {#if request.status === "pending"}
                  <Button tone="danger" onclick={() => cancelRequest(request._id)} disabled={actionId === request._id}>ביטול</Button>
                {/if}
              </article>
            {/each}
          </div>
        {/if}
      </section>
    </div>
  {/if}
</PageShell>

<style>
  .one-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
    gap: var(--space-5);
    align-items: start;
  }

  .panel,
  .state-card,
  .request-card {
    border: var(--border);
    background: linear-gradient(135deg, color-mix(in srgb, var(--white) 97%, var(--beige) 3%), var(--white));
    padding: var(--space-5);
  }

  .panel {
    display: grid;
    gap: var(--space-4);
  }

  h2,
  h3,
  p {
    margin: 0;
  }

  h2 {
    font-size: var(--step-1);
  }

  .card-list,
  .compact-list {
    display: grid;
    gap: var(--space-3);
  }

  .request-card {
    display: grid;
    gap: var(--space-3);
  }

  .muted,
  .request-card p {
    color: var(--muted);
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: var(--space-3);
  }

  label,
  .note-field {
    display: grid;
    gap: var(--space-2);
    font-weight: 800;
  }

  input,
  textarea {
    min-width: 0;
    min-height: 42px;
    border: var(--border);
    background: var(--white);
    color: var(--ink);
    padding: var(--space-2) var(--space-3);
    font: inherit;
  }

  textarea {
    resize: vertical;
  }

  .actions {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .button-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 40px;
    border: var(--border);
    background: var(--ink);
    color: var(--white);
    padding-inline: var(--space-4);
    font: inherit;
    font-weight: 800;
    cursor: pointer;
    text-decoration: none;
    border-radius: 0;
    will-change: border-radius;
    transition:
      background var(--duration-fast),
      border-radius 0.55s cubic-bezier(0.34, 1.8, 0.64, 1);
  }

  .button-link:hover {
    background: var(--ink-secondary);
    border-radius: 20px;
  }

  .compact-row {
    display: flex;
    justify-content: space-between;
    gap: var(--space-3);
    border: 1px solid var(--line-light);
    padding: var(--space-2) var(--space-3);
    font-family: var(--font-mono);
    font-size: var(--step--1);
  }
</style>
