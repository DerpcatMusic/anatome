<script lang="ts">
  import Button from "$components/ui/Button.svelte";
  import { api } from "$convex/_generated/api";
  import type { FunctionReturnType } from "convex/server";
  import { useConvexClient, useQuery } from "convex-svelte";
  import Notice from "$components/ui/Notice.svelte";
  import Select from "$components/ui/Select.svelte";

  type Request = FunctionReturnType<typeof api.instructorOneOnOne.listRequests>[number];
  type Rule = FunctionReturnType<typeof api.instructorOneOnOne.listAvailability>[number];

  const client = useConvexClient();
  const requestsQuery = useQuery(api.instructorOneOnOne.listRequests, {});
  const availabilityQuery = useQuery(api.instructorOneOnOne.listAvailability, {});

  const requests = $derived(requestsQuery.data ?? []);
  const rules = $derived(availabilityQuery.data ?? []);

  let weekday = $state(1);
  let startTime = $state("09:00");
  let endTime = $state("13:00");
  let slotMinutes = $state(50);
  let bufferMinutes = $state(10);
  let action = $state("");
  let error = $state("");

  const weekdays = [
    ["0", "ראשון"],
    ["1", "שני"],
    ["2", "שלישי"],
    ["3", "רביעי"],
    ["4", "חמישי"],
    ["5", "שישי"],
    ["6", "שבת"],
  ] as const;
  const weekdayOptions = weekdays.map(([value, label]) => ({ value: Number(value), label }));

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

  function minutesFromTime(value: string) {
    const [hours, minutes] = value.split(":").map(Number);
    return hours * 60 + minutes;
  }

  function timeFromMinutes(value: number) {
    return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
  }

  function ruleLabel(rule: Rule) {
    return `${weekdays[rule.weekday]?.[1] ?? ""}, ${timeFromMinutes(rule.startMinute)}-${timeFromMinutes(rule.endMinute)}`;
  }

  async function saveAvailability() {
    action = "availability";
    error = "";
    try {
      await client.mutation(api.instructorOneOnOne.setAvailabilityRule, {
        weekday,
        startMinute: minutesFromTime(startTime),
        endMinute: minutesFromTime(endTime),
        slotMinutes,
        bufferMinutes,
        isActive: true,
      });
    } catch (reason) {
      error = reason instanceof Error ? reason.message : "לא הצלחנו לשמור זמינות.";
    } finally {
      action = "";
    }
  }

  async function toggleRule(rule: Rule) {
    action = rule._id;
    error = "";
    try {
      await client.mutation(api.instructorOneOnOne.setAvailabilityRule, {
        ruleId: rule._id,
        weekday: rule.weekday,
        startMinute: rule.startMinute,
        endMinute: rule.endMinute,
        slotMinutes: rule.slotMinutes,
        bufferMinutes: rule.bufferMinutes,
        isActive: !rule.isActive,
      });
    } catch (reason) {
      error = reason instanceof Error ? reason.message : "לא הצלחנו לעדכן זמינות.";
    } finally {
      action = "";
    }
  }

  async function approve(request: Request) {
    action = request._id;
    error = "";
    try {
      await client.mutation(api.instructorOneOnOne.approveRequest, { requestId: request._id });
    } catch (reason) {
      error = reason instanceof Error ? reason.message : "לא הצלחנו לאשר בקשה.";
    } finally {
      action = "";
    }
  }

  async function reject(request: Request) {
    action = request._id;
    error = "";
    try {
      await client.mutation(api.instructorOneOnOne.rejectRequest, { requestId: request._id });
    } catch (reason) {
      error = reason instanceof Error ? reason.message : "לא הצלחנו לדחות בקשה.";
    } finally {
      action = "";
    }
  }
</script>

<section class="studio-one-on-one">
  <div class="panel-head">
    <div>
      <p class="eyebrow">1:1</p>
      <h2>בקשות וזמינות אישית</h2>
    </div>
  </div>

  {#if requestsQuery.error || availabilityQuery.error || error}
    <Notice tone="danger">{requestsQuery.error?.message ?? availabilityQuery.error?.message ?? error}</Notice>
  {/if}

  <div class="studio-one-on-one__grid">
    <section class="inner-panel">
      <h3>פתיחת זמינות</h3>
      <form class="availability-form" onsubmit={(event) => { event.preventDefault(); void saveAvailability(); }}>
        <Select label="יום" bind:value={weekday} options={weekdayOptions} compact />
        <label>
          <span>משעה</span>
          <input type="time" bind:value={startTime} />
        </label>
        <label>
          <span>עד שעה</span>
          <input type="time" bind:value={endTime} />
        </label>
        <label>
          <span>משך</span>
          <input type="number" min="20" max="120" bind:value={slotMinutes} />
        </label>
        <label>
          <span>מרווח</span>
          <input type="number" min="0" max="60" bind:value={bufferMinutes} />
        </label>
        <Button type="submit" tone="ink" disabled={action === "availability"}>{action === "availability" ? "שומרות..." : "לפתוח זמינות"}</Button>
      </form>

      <div class="rule-list">
        {#each rules as rule}
          <button type="button" class:rule--inactive={!rule.isActive} class="rule" onclick={() => toggleRule(rule)}>
            <span>{ruleLabel(rule)}</span>
            <small>{rule.slotMinutes} דק׳ + {rule.bufferMinutes} דק׳ מרווח</small>
          </button>
        {/each}
      </div>
    </section>

    <section class="inner-panel">
      <h3>בקשות ממתינות</h3>
      {#if requests.length === 0}
        <p class="muted">אין כרגע בקשות 1:1 שממתינות לאישור.</p>
      {:else}
        <div class="request-list">
          {#each requests as request}
            <article class="request-card">
              <div>
                <strong>{dayFormatter.format(new Date(request.requestedStartsAt))}</strong>
                <span>{timeFormatter.format(new Date(request.requestedStartsAt))} - {timeFormatter.format(new Date(request.requestedEndsAt))}</span>
              </div>
              {#if request.note}
                <p>{request.note}</p>
              {/if}
              <div class="row-actions">
                <Button type="button" tone="ink" disabled={action === request._id} onclick={() => approve(request)}>לאשר</Button>
                <Button type="button" tone="paper" disabled={action === request._id} onclick={() => reject(request)}>לדחות</Button>
              </div>
            </article>
          {/each}
        </div>
      {/if}
    </section>
  </div>
</section>

<style>
  .studio-one-on-one,
  .inner-panel {
    border: var(--border);
    background: linear-gradient(135deg, color-mix(in srgb, var(--white) 97%, var(--beige) 3%), var(--white));
    padding: clamp(16px, 2vw, 24px);
    display: grid;
    gap: var(--space-4);
  }

  .studio-one-on-one__grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: var(--space-4);
  }

  .panel-head {
    display: flex;
    justify-content: space-between;
    gap: var(--space-4);
  }

  h2,
  h3,
  p {
    margin: 0;
  }

  .eyebrow {
    font-family: var(--font-mono);
    color: var(--muted);
    font-size: var(--step--2);
    text-transform: uppercase;
  }

  .availability-form {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: var(--space-3);
    align-items: end;
  }

  label {
    display: grid;
    gap: 6px;
    font-weight: 700;
  }

  input,
  button {
    min-height: 42px;
    border: var(--border);
    background: var(--white);
    color: var(--ink);
    font: inherit;
    font-weight: 800;
    padding: 0 var(--space-3);
  }

  .rule-list,
  .request-list {
    display: grid;
    gap: var(--space-2);
  }

  .rule {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    text-align: start;
  }

  .rule--inactive {
    opacity: 0.45;
  }

  .request-card {
    border-block-start: var(--border);
    padding-block-start: var(--space-3);
    display: grid;
    gap: var(--space-3);
  }

  .request-card > div:first-child {
    display: grid;
    gap: 4px;
  }

  .row-actions {
    display: flex;
    gap: var(--space-2);
  }

  .muted {
    color: var(--muted);
  }

  @media (max-width: 980px) {
    .studio-one-on-one__grid,
    .availability-form {
      grid-template-columns: 1fr;
    }
  }
</style>
