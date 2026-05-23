<script lang="ts">
  import { Button } from "bits-ui";
  import { resource, TextareaAutosize } from "runed";
  import { api } from "$convex/_generated/api";
  import type { Id } from "$convex/_generated/dataModel";
  import { authQuery, initAuth } from "$lib/auth/session.svelte";
  import { useQuery, useConvexClient } from "convex-svelte";
  import PageShell from "$features/app/components/PageShell.svelte";
  import Notice from "$components/ui/Notice.svelte";
  import { Select } from "bits-ui";
  import "./OneOnOneShell.css";

  const auth = initAuth();
  const profileQuery = useQuery(api.profiles.viewer.get, () => auth.isAuthenticated ? {} : "skip");
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
      return await authQuery(api.oneOnOne.customer.listAvailableSlots, range);
    }
  );

  const mineResource = resource(
    () => auth.isAuthenticated && !isStaff,
    async (enabled) => {
      if (!enabled) return [];
      return await authQuery(api.oneOnOne.customer.listMine, {});
    }
  );

  const requestsResource = resource(
    () => auth.isAuthenticated && isStaff,
    async (enabled) => {
      if (!enabled) return [];
      return await authQuery(api.oneOnOne.instructor.listRequests, {});
    }
  );

  const availabilityResource = resource(
    () => auth.isAuthenticated && isStaff,
    async (enabled) => {
      if (!enabled) return [];
      return await authQuery(api.oneOnOne.instructor.listAvailability, {});
    }
  );

  // ── Formatters ──
  const dayFormatter = new Intl.DateTimeFormat("he-IL", {
    weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Jerusalem",
  });
  const timeFormatter = new Intl.DateTimeFormat("he-IL", {
    hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jerusalem",
  });
  const slotDateFormatter = new Intl.DateTimeFormat("he-IL", {
    weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jerusalem",
  });

  // ── Status labels ──
  const statusLabels: Record<string, string> = {
    pending: "ממתינה לאישור",
    approved: "אושרה",
    rejected: "נדחתה",
    cancelled: "בוטלה",
    expired: "פג תוקף",
  };

  // ── Weekday names ──
  const weekdayNames = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"] as const;
  const weekdayOptions = weekdayNames.map((label, value) => ({ value, label }));

  // ── State ──
  let actionId = $state<string | null>(null);
  let actionError = $state("");
  let note = $state("");
  let noteEl = $state<HTMLTextAreaElement | null>(null);
  const noteAutosize = new TextareaAutosize({ element: () => noteEl ?? undefined, input: () => note });

  // Availability form state
  let editingRuleId = $state<Id<"oneOnOneAvailabilityRules"> | undefined>(undefined);
  let weekday = $state(0);
  let startTime = $state("09:00");
  let endTime = $state("13:00");
  let slotMinutes = $state(50);
  let bufferMinutes = $state(10);

  const client = useConvexClient();

  function minutesFromTime(value: string) {
    const [h, m] = value.split(":").map(Number);
    return h * 60 + m;
  }
  function timeFromMinutes(value: number) {
    return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
  }
  function ruleLabel(rule: { weekday: number; startMinute: number; endMinute: number }) {
    return `${weekdayNames[rule.weekday] ?? ""}, ${timeFromMinutes(rule.startMinute)}–${timeFromMinutes(rule.endMinute)}`;
  }

  function loadRuleForEdit(rule: { _id: Id<"oneOnOneAvailabilityRules">; weekday: number; startMinute: number; endMinute: number; slotMinutes: number; bufferMinutes: number }) {
    editingRuleId = rule._id;
    weekday = rule.weekday;
    startTime = timeFromMinutes(rule.startMinute);
    endTime = timeFromMinutes(rule.endMinute);
    slotMinutes = rule.slotMinutes;
    bufferMinutes = rule.bufferMinutes;
  }

  function resetForm() {
    editingRuleId = undefined;
    weekday = 0;
    startTime = "09:00";
    endTime = "13:00";
    slotMinutes = 50;
    bufferMinutes = 10;
  }

  async function saveAvailability(e: Event) {
    e.preventDefault();
    actionId = "availability";
    actionError = "";
    try {
      await client.mutation(api.oneOnOne.instructor.setAvailabilityRule, {
        ruleId: editingRuleId,
        weekday,
        startMinute: minutesFromTime(startTime),
        endMinute: minutesFromTime(endTime),
        slotMinutes,
        bufferMinutes,
        isActive: true,
      });
      await availabilityResource.refetch();
      if (!editingRuleId) resetForm();
    } catch (reason) {
      actionError = reason instanceof Error ? reason.message : "לא הצלחנו לשמור זמינות.";
    } finally {
      actionId = null;
    }
  }

  async function toggleRule(rule: { _id: Id<"oneOnOneAvailabilityRules">; weekday: number; startMinute: number; endMinute: number; slotMinutes: number; bufferMinutes: number; isActive: boolean }) {
    actionId = rule._id;
    actionError = "";
    try {
      await client.mutation(api.oneOnOne.instructor.setAvailabilityRule, {
        ruleId: rule._id,
        weekday: rule.weekday,
        startMinute: rule.startMinute,
        endMinute: rule.endMinute,
        slotMinutes: rule.slotMinutes,
        bufferMinutes: rule.bufferMinutes,
        isActive: !rule.isActive,
      });
      await availabilityResource.refetch();
    } catch (reason) {
      actionError = reason instanceof Error ? reason.message : "לא הצלחנו לעדכן זמינות.";
    } finally {
      actionId = null;
    }
  }

  async function approveRequest(requestId: Id<"oneOnOneRequests">) {
    actionId = requestId;
    actionError = "";
    try {
      await client.mutation(api.oneOnOne.instructor.approveRequest, { requestId });
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
      await client.mutation(api.oneOnOne.instructor.rejectRequest, { requestId });
      await requestsResource.refetch();
    } catch (reason) {
      actionError = reason instanceof Error ? reason.message : "לא הצלחנו לדחות.";
    } finally {
      actionId = null;
    }
  }

  async function requestSlot(slot: { instructorUserId: Id<"users">; startsAt: number; endsAt: number }) {
    actionId = String(slot.startsAt);
    actionError = "";
    try {
      await client.mutation(api.oneOnOne.customer.requestSlot, { ...slot, note });
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
      await client.mutation(api.oneOnOne.customer.cancelRequest, { requestId });
      await mineResource.refetch();
    } catch (reason) {
      actionError = reason instanceof Error ? reason.message : "לא הצלחנו לבטל.";
    } finally {
      actionId = null;
    }
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
    <!-- ── Instructor View ── -->
    <div class="one-grid">
      <!-- Availability Panel -->
      <section class="panel">
        <h2>זמינות שבועית</h2>

        <form class="availability-form" onsubmit={saveAvailability}>
          <div class="hb-field hb-field--compact">
            <span class="hb-field__label">יום</span>
            <Select.Root
              type="single"
              value={String(weekday)}
              onValueChange={(v) => weekday = Number(v)}
              items={weekdayOptions.map((o) => ({ value: String(o.value), label: o.label }))}
            >
              <Select.Trigger class="hb-select__trigger" aria-label="יום">
                <span class="hb-select__value">{weekdayOptions.find((o) => o.value === weekday)?.label ?? ""}</span>
                <span class="hb-select__chevron" aria-hidden="true"></span>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content class="hb-select__content" sideOffset={6}>
                  <Select.Viewport class="hb-select__viewport">
                    {#each weekdayOptions as option}
                      <Select.Item class="hb-select__item" value={String(option.value)} label={option.label}>
                        {#snippet children({ selected })}
                          <span>{option.label}</span>
                          {#if selected}
                            <span class="hb-select__check" aria-hidden="true"></span>
                          {/if}
                        {/snippet}
                      </Select.Item>
                    {/each}
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
          </div>
          <label class="time-field">
            <span>משעה</span>
            <input type="time" bind:value={startTime} required />
          </label>
          <label class="time-field">
            <span>עד שעה</span>
            <input type="time" bind:value={endTime} required />
          </label>
          <label class="time-field">
            <span>משך (דקות)</span>
            <input type="number" min="20" max="120" bind:value={slotMinutes} required />
          </label>
          <label class="time-field">
            <span>מרווח (דקות)</span>
            <input type="number" min="0" max="60" bind:value={bufferMinutes} required />
          </label>
          <div class="form-actions">
            <Button.Root class="hb-button hb-button--ink" type="submit" disabled={actionId === "availability"}>
              {actionId === "availability" ? "שומרות..." : editingRuleId ? "עדכון כלל" : "הוספת כלל"}
            </Button.Root>
            {#if editingRuleId}
              <Button.Root class="hb-button hb-button--paper" type="button" onclick={resetForm}>ביטול עריכה</Button.Root>
            {/if}
          </div>
        </form>

        <!-- Rules List -->
        <div class="rules-list">
          {#if (availabilityResource.current ?? []).length === 0}
            <div class="empty-state">
              <span class="material-symbols-rounded empty-icon">event_busy</span>
              <p>אין עדיין כללי זמינות.</p>
              <p class="empty-hint">הגדירי ימים ושעות שבהם את פנויה לשיעורים אישיים.</p>
            </div>
          {:else}
            {#each availabilityResource.current ?? [] as rule}
              <div class="rule-row" class:rule-row--inactive={!rule.isActive}>
                <div class="rule-info">
                  <span class="rule-title">{ruleLabel(rule)}</span>
                  <span class="rule-meta">{rule.slotMinutes} דק׳ · {rule.bufferMinutes} דק׳ מרווח · {rule.isActive ? "פעיל" : "מושבת"}</span>
                </div>
                <div class="rule-actions">
                  <button type="button" class="rule-btn" onclick={() => loadRuleForEdit(rule)} title="עריכה">
                    <span class="material-symbols-rounded">edit</span>
                  </button>
                  <button type="button" class="rule-btn" onclick={() => toggleRule(rule)} title={rule.isActive ? "השבתה" : "הפעלה"}>
                    <span class="material-symbols-rounded">{rule.isActive ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
              </div>
            {/each}
          {/if}
        </div>
      </section>

      <!-- Pending Requests Panel -->
      <section class="panel">
        <h2>בקשות ממתינות</h2>
        {#if (requestsResource.current ?? []).length === 0}
          <div class="empty-state">
            <span class="material-symbols-rounded empty-icon">inbox</span>
            <p>אין בקשות ממתינות כרגע.</p>
            <p class="empty-hint">כאשר לקוחה תבקש שיעור 1:1, הבקשה תופיע כאן.</p>
          </div>
        {:else}
          <div class="request-list">
            {#each requestsResource.current ?? [] as request}
              <article class="request-card">
                <div class="request-header">
                  <strong>{dayFormatter.format(new Date(request.requestedStartsAt))}</strong>
                  <span class="request-time">{timeFormatter.format(new Date(request.requestedStartsAt))} – {timeFormatter.format(new Date(request.requestedEndsAt))}</span>
                </div>
                {#if request.note}
                  <p class="request-note">{request.note}</p>
                {/if}
                <div class="request-actions">
                  <Button.Root class="hb-button hb-button--ink hb-button--sm" type="button" onclick={() => approveRequest(request._id)} disabled={actionId === request._id}>אישור</Button.Root>
                  <Button.Root class="hb-button hb-button--paper hb-button--sm" type="button" onclick={() => rejectRequest(request._id)} disabled={actionId === request._id}>דחייה</Button.Root>
                </div>
              </article>
            {/each}
          </div>
        {/if}
      </section>
    </div>
  {:else}
    <!-- ── Customer View ── -->
    {#if slotsResource.error}<Notice tone="danger">{slotsResource.error.message}</Notice>{/if}
    <label class="note-field">
      <span>הערה למדריכה</span>
      <textarea bind:value={note} bind:this={noteEl} maxlength="500" placeholder="מטרות, מגבלות, או משהו שכדאי לדעת"></textarea>
    </label>

    <div class="one-grid">
      <section class="panel">
        <h2>חלונות פנויים</h2>
        {#if (slotsResource.current ?? []).length === 0}
          <div class="empty-state">
            <span class="material-symbols-rounded empty-icon">event_busy</span>
            <p>אין חלונות פנויים בשבועיים הקרובים.</p>
          </div>
        {:else}
          <div class="request-list">
            {#each slotsResource.current ?? [] as slot}
              <article class="request-card">
                <h3>{slotDateFormatter.format(new Date(slot.startsAt))}</h3>
                <p class={slot.availableCredits > 0 ? "has-credits" : "no-credits"}>
                  {slot.availableCredits > 0 ? "יש קרדיט 1:1 זמין" : "אין קרדיט 1:1 זמין"}
                </p>
                <Button.Root class="hb-button hb-button--ink hb-button--sm" type="button" onclick={() => requestSlot(slot)} disabled={slot.availableCredits <= 0 || actionId === String(slot.startsAt)}>
                  לשלוח בקשה
                </Button.Root>
              </article>
            {/each}
          </div>
        {/if}
      </section>

      <section class="panel">
        <h2>הבקשות שלי</h2>
        {#if (mineResource.current ?? []).length === 0}
          <div class="empty-state">
            <span class="material-symbols-rounded empty-icon">inbox</span>
            <p>אין עדיין בקשות.</p>
          </div>
        {:else}
          <div class="request-list">
            {#each mineResource.current ?? [] as request}
              <article class="request-card">
                <h3>{slotDateFormatter.format(new Date(request.requestedStartsAt))}</h3>
                <span class="status-badge status-badge--{request.status}">{statusLabels[request.status] ?? request.status}</span>
                {#if request.status === "pending"}
                  <Button.Root class="hb-button hb-button--paper hb-button--sm" type="button" onclick={() => cancelRequest(request._id)} disabled={actionId === request._id}>ביטול בקשה</Button.Root>
                {/if}
              </article>
            {/each}
          </div>
        {/if}
      </section>
    </div>
  {/if}
</PageShell>

