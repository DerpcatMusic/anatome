<script lang="ts">
  import { Button } from "bits-ui";
  import DatePicker from "$components/ui/DatePicker.svelte";
  import EquipmentPicker from "$components/ui/EquipmentPicker.svelte";
  import type { Equipment } from "$lib/labels";
  import { TextareaAutosize } from "runed";
  import { parseDate } from "@internationalized/date";
  import type { DateValue } from "@internationalized/date";

  let {
    title = $bindable(),
    description = $bindable(),
    liveType = $bindable<"group_live" | "one_on_one">(),
    startsAtLocal = $bindable(),
    durationMinutes = $bindable(),
    joinOpensMinutesBefore = $bindable(),
    capacity = $bindable(),
    requiredEquipment = $bindable<Equipment[]>(),
    pending = false,
    onSubmit,
  }: {
    title: string;
    description: string;
    liveType: "group_live" | "one_on_one";
    startsAtLocal: string;
    durationMinutes: number;
    joinOpensMinutesBefore: number;
    capacity: number;
    requiredEquipment: Equipment[];
    pending?: boolean;
    onSubmit: () => void;
  } = $props();

  // Internal time state
  let dateValue = $state<DateValue | undefined>(undefined);
  let startTime = $state("07:00");
  let endTime = $state("08:00");
  let descEl = $state<HTMLTextAreaElement | null>(null);
  const descAutosize = new TextareaAutosize({ element: () => descEl ?? undefined, input: () => description });

  const dateFormatter = new Intl.DateTimeFormat("he-IL", {
    weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Jerusalem",
  });

  const shortDateFormatter = new Intl.DateTimeFormat("he-IL", {
    weekday: "short", day: "numeric", month: "short", timeZone: "Asia/Jerusalem",
  });

  // Sync internal state from external props
  $effect(() => {
    const current = startsAtLocal;
    if (!current) return;
    const [datePart, timePart] = current.split("T");
    if (datePart) {
      try { dateValue = parseDate(datePart); } catch { /* keep current */ }
    }
    if (timePart) {
      startTime = timePart;
      const [h, m] = timePart.split(":").map(Number);
      const startMin = h * 60 + m;
      const endMin = startMin + durationMinutes;
      const endH = Math.floor(endMin / 60) % 24;
      const endM = endMin % 60;
      endTime = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
    }
  });

  // Auto-update end time when start time changes (preserve duration)
  let previousStartTime = "";
  $effect(() => {
    const currentStart = startTime;
    if (currentStart === previousStartTime) return;
    const oldStartMin = timeToMinutes(previousStartTime || currentStart);
    const newStartMin = timeToMinutes(currentStart);
    const oldEndMin = timeToMinutes(endTime);
    const duration = oldEndMin - oldStartMin;
    const newEndMin = newStartMin + (duration > 0 ? duration : 50);
    endTime = minutesToTime(newEndMin);
    previousStartTime = currentStart;
  });

  function timeToMinutes(t: string) {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  }

  function minutesToTime(min: number) {
    const h = Math.floor(min / 60) % 24;
    const m = min % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  function computeDuration(): number {
    const diff = timeToMinutes(endTime) - timeToMinutes(startTime);
    return diff > 0 ? diff : diff + 24 * 60;
  }

  const formattedDate = $derived(dateValue ? shortDateFormatter.format(new Date(dateValue.toString())) : "בחרו תאריך");
  const computedDuration = $derived(computeDuration());
  const durationLabel = $derived(`${computedDuration} דק׳`);

  function handleSubmit(e: Event) {
    e.preventDefault();
    if (!dateValue) return;
    startsAtLocal = `${dateValue.toString()}T${startTime}`;
    durationMinutes = computeDuration();
    onSubmit();
  }

  function setType(type: "group_live" | "one_on_one") {
    liveType = type;
    if (type === "one_on_one") capacity = 1;
  }
</script>

<form onsubmit={handleSubmit} class="studio-form">
  <!-- Title -->
  <div class="form-field">
    <label class="field-label" for="create-title">כותרת השיעור</label>
    <input id="create-title" class="hb-input" bind:value={title} required maxlength="120" placeholder="למשל: פילאטיס מזרן דינמי" />
  </div>

  <!-- Type toggle -->
  <div class="form-field">
    <span class="field-label">סוג שיעור</span>
    <div class="type-toggle">
      <button
        type="button"
        class="type-toggle__btn"
        class:type-toggle__btn--active={liveType === "group_live"}
        onclick={() => setType("group_live")}
      >
        <span class="material-symbols-rounded">groups</span>
        <span>שיעור קבוצתי</span>
      </button>
      <button
        type="button"
        class="type-toggle__btn"
        class:type-toggle__btn--active={liveType === "one_on_one"}
        onclick={() => setType("one_on_one")}
      >
        <span class="material-symbols-rounded">person</span>
        <span>אימון אישי 1:1</span>
      </button>
    </div>
  </div>

  <!-- Equipment -->
  <div class="form-field">
    <span class="field-label">ציוד נדרש</span>
    <EquipmentPicker compact bind:selected={requiredEquipment} />
  </div>

  <!-- Date + Time row -->
  <div class="form-field">
    <span class="field-label">מועד השיעור</span>
    <div class="datetime-row">
      <div class="date-field">
        <DatePicker label="" bind:value={dateValue} />
        <span class="date-display">{formattedDate}</span>
      </div>
      <label class="time-field">
        <span class="time-label">התחלה</span>
        <input type="time" class="hb-input" bind:value={startTime} step="60" />
      </label>
      <label class="time-field">
        <span class="time-label">סיום</span>
        <input type="time" class="hb-input" bind:value={endTime} step="60" />
      </label>
      <div class="duration-badge">{durationLabel}</div>
    </div>
  </div>

  <!-- Settings row -->
  <div class="settings-row">
    {#if liveType === "group_live"}
      <label class="settings-field">
        <span class="settings-label">קיבולת</span>
        <input type="number" class="hb-input" bind:value={capacity} min="1" max="50" step="1" />
      </label>
    {/if}
    <label class="settings-field">
      <span class="settings-label">פתיחה (דק׳ לפני)</span>
      <input type="number" class="hb-input" bind:value={joinOpensMinutesBefore} min="0" max="60" step="5" />
    </label>
  </div>

  <!-- Description -->
  <div class="form-field">
    <label class="field-label" for="create-desc">תיאור <span class="field-optional">(אופציונלי)</span></label>
    <textarea id="create-desc" class="hb-textarea" bind:value={description} bind:this={descEl} maxlength="500" rows="2" placeholder="פרטים על קצב השיעור, מיקוד גופני או דגשים..."></textarea>
  </div>

  <!-- Submit -->
  <div class="form-actions">
    <Button.Root class="hb-button hb-button--ink" type="submit" disabled={pending || requiredEquipment.length === 0 || !dateValue}>
      {pending ? "יוצרות..." : "לתזמן לייב"}
    </Button.Root>
  </div>
</form>

<style>
  .studio-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .form-field {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .field-label {
    font-weight: 800;
    font-size: var(--step--1);
    color: var(--ink);
  }

  .field-optional {
    font-weight: 600;
    color: var(--muted);
  }

  /* Type toggle */
  .type-toggle {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-2);
  }

  .type-toggle__btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    min-height: 44px;
    padding: var(--space-2) var(--space-3);
    border: var(--border);
    background: var(--white);
    color: var(--ink);
    font: inherit;
    font-weight: 800;
    font-size: var(--step--1);
    cursor: pointer;
    border-radius: 4px;
    transition: background 0.2s ease, border-color 0.2s ease, border-radius 0.35s ease, transform 0.08s ease;
  }

  .type-toggle__btn:hover {
    background: var(--surface);
    border-color: var(--sky-strong);
    border-radius: 22px;
  }

  .type-toggle__btn:active {
    transform: translateY(1px);
    background: var(--line-light);
  }

  .type-toggle__btn--active {
    background: var(--sky);
    border-color: var(--ink);
  }

  .type-toggle__btn--active:hover {
    background: var(--sky-strong);
    color: var(--white);
    border-color: var(--ink);
  }

  .type-toggle__btn .material-symbols-rounded {
    font-size: var(--step-1);
  }

  /* Date + time row */
  .datetime-row {
    display: grid;
    grid-template-columns: 1.4fr 1fr 1fr auto;
    gap: var(--space-2);
    align-items: end;
  }

  .date-field {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    position: relative;
  }

  .date-field :global(.hb-date-picker) {
    gap: 0;
  }

  .date-field :global(.hb-date-picker__label) {
    display: none;
  }

  .date-display {
    font-size: var(--step--1);
    font-weight: 700;
    color: var(--muted);
    padding-inline: var(--space-1);
  }

  .time-field {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .time-label {
    font-size: var(--step--2);
    font-weight: 800;
    color: var(--muted);
    font-family: var(--font-mono);
    text-transform: uppercase;
  }

  .duration-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    padding: 0 var(--space-3);
    background: var(--surface);
    border: var(--border);
    border-radius: 4px;
    font-family: var(--font-mono);
    font-weight: 800;
    font-size: var(--step--1);
    color: var(--muted);
    white-space: nowrap;
  }

  /* Settings row */
  .settings-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-3);
  }

  .settings-field {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .settings-label {
    font-size: var(--step--2);
    font-weight: 800;
    color: var(--muted);
    font-family: var(--font-mono);
    text-transform: uppercase;
  }

  /* Actions */
  .form-actions {
    display: flex;
    justify-content: flex-end;
    padding-top: var(--space-2);
    border-top: var(--border);
  }

  @media (max-width: 520px) {
    .datetime-row {
      grid-template-columns: 1fr 1fr;
    }

    .date-field {
      grid-column: 1 / -1;
    }

    .duration-badge {
      grid-column: 1 / -1;
    }

    .settings-row {
      grid-template-columns: 1fr;
    }
  }
</style>
