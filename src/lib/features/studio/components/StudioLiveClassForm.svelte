<script lang="ts">
  import { Button } from "bits-ui";
  import DatePicker from "$components/ui/DatePicker.svelte";
  import EquipmentPicker from "$components/ui/EquipmentPicker.svelte";
  import { RadioGroup } from "bits-ui";
  import FormSection from "$features/app/components/FormSection.svelte";
  import type { Equipment } from "$lib/labels";
  import { TextareaAutosize } from "runed";
  import { CalendarDate, toCalendarDateTime, parseDate, parseTime } from "@internationalized/date";
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

  const liveTypeOptions = [
    { value: "group_live", label: "לייב קבוצתי", description: "עד 12 משתתפות, קרדיט לייב אחד" },
    { value: "one_on_one", label: "1:1 אישי", description: "משתתפת אחת, קרדיט 1:1 אחד" },
  ];

  let dateValue = $state<DateValue | undefined>(undefined);
  let descEl = $state<HTMLTextAreaElement | null>(null);
  const descAutosize = new TextareaAutosize({ element: () => descEl ?? undefined, input: () => description });

  const hebrewDateFormatter = new Intl.DateTimeFormat("he-IL", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jerusalem",
  });
  const timeFormatter = new Intl.DateTimeFormat("he-IL", {
    hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jerusalem",
  });

  // ── Derived displays ──
  const timeSummary = $derived.by(() => {
    if (!startsAtLocal) return { date: "", start: "", end: "", duration: "" };
    const [datePart, timePart] = startsAtLocal.split("T");
    if (!datePart || !timePart) return { date: "", start: "", end: "", duration: "" };

    const startDate = new Date(startsAtLocal);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

    return {
      date: hebrewDateFormatter.format(startDate),
      start: timeFormatter.format(startDate),
      end: timeFormatter.format(endDate),
      duration: `${durationMinutes} דק׳`,
    };
  });

  // ── Sync dateValue ↔ startsAtLocal ──
  function updateDateFromPicker(next: DateValue | undefined) {
    if (!next || !startsAtLocal) return;
    const timePart = startsAtLocal.split("T")[1] ?? "00:00";
    startsAtLocal = `${next.toString()}T${timePart}`;
  }

  // Initialize dateValue from startsAtLocal
  let previousStartsAtLocal = $state(startsAtLocal);
  $effect(() => {
    const current = startsAtLocal;
    if (current === previousStartsAtLocal) return;
    previousStartsAtLocal = current;
    if (!current) return;
    const [datePart] = current.split("T");
    if (!datePart) return;
    try {
      dateValue = parseDate(datePart);
    } catch {
      dateValue = undefined;
    }
  });
</script>

<form onsubmit={(event) => { event.preventDefault(); onSubmit(); }}>
  <div class="studio-form-layout">
    <!-- Scheduling Summary -->
    <section class="time-summary-section">
      <div class="time-badge">
        <span class="time-badge__date">{timeSummary.date}</span>
        <div class="time-badge__range">
          <span class="time-badge__start">{timeSummary.start}</span>
          <span class="time-badge__sep">–</span>
          <span class="time-badge__end">{timeSummary.end}</span>
          <span class="time-badge__duration">({timeSummary.duration})</span>
        </div>
      </div>
      <div class="date-adjust">
        <DatePicker label="שינוי תאריך" bind:value={dateValue} onchange={updateDateFromPicker} />
      </div>
    </section>

    <!-- Class Settings -->
    <section class="settings-section">
      <FormSection title="פרטי השיעור">
        <RadioGroup.Root class="hb-choice-grid live-type-switch" bind:value={liveType} orientation="horizontal">
          {#each liveTypeOptions as option}
            <RadioGroup.Item class="hb-choice" value={option.value}>
              <span class="hb-choice__title">{option.label}</span>
              {#if option.description}
                <span class="hb-choice__description">{option.description}</span>
              {/if}
            </RadioGroup.Item>
          {/each}
        </RadioGroup.Root>

        <div class="hb-input-field">
          <span class="hb-input-field__label">כותרת</span>
          <input class="hb-input" bind:value={title} required maxlength="120" placeholder="למשל: פילאטיס מזרן דינמי" />
        </div>

        <div class="hb-input-field">
          <span class="hb-input-field__label">תיאור</span>
          <textarea class="hb-textarea" bind:value={description} bind:this={descEl} maxlength="500" placeholder="פרטים על קצב השיעור, מיקוד גופני או דגשים..."></textarea>
        </div>

        <div class="compact-settings-row">
          {#if liveType === "group_live"}
            <label class="compact-field">
              <span class="compact-field__label">קיבולת</span>
              <div class="compact-input-wrap">
                <input
                  type="number"
                  class="compact-input"
                  bind:value={capacity}
                  min="1"
                  max="12"
                  step="1"
                  required
                />
                <span class="compact-suffix">מקומות</span>
              </div>
            </label>
          {:else}
            <div class="compact-field compact-field--readonly">
              <span class="compact-field__label">קיבולת</span>
              <div class="one-on-one-badge">1 משתתפת (אישי)</div>
            </div>
          {/if}

          <div class="compact-field compact-field--readonly">
            <span class="compact-field__label">כניסה לשיעור</span>
            <span class="compact-suffix">נפתחת 10 דק׳ לפני תחילתו</span>
          </div>
        </div>
      </FormSection>
    </section>

    <!-- Equipment -->
    <section class="equipment-section">
      <EquipmentPicker bind:selected={requiredEquipment} label="ציוד חובה לשיעור" />
    </section>
  </div>

  <div class="form-actions">
    <Button.Root class="hb-button hb-button--ink" type="submit" disabled={pending || requiredEquipment.length === 0}>
      {pending ? "יוצרות..." : "לתזמן לייב"}
    </Button.Root>
  </div>
</form>

<style>
  form {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  .studio-form-layout {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  /* ── Time Summary Badge ── */
  .time-summary-section {
    border: var(--border);
    background: var(--surface);
    padding: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .time-badge {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: var(--space-1);
  }

  .time-badge__date {
    font-size: var(--step--1);
    font-weight: 700;
    color: var(--muted);
  }

  .time-badge__range {
    display: flex;
    align-items: baseline;
    gap: var(--space-2);
    flex-wrap: wrap;
    justify-content: center;
  }

  .time-badge__start,
  .time-badge__end {
    font-family: var(--font-mono);
    font-size: var(--step-2);
    font-weight: 900;
    color: var(--ink);
    line-height: 1;
  }

  .time-badge__sep {
    font-family: var(--font-mono);
    font-size: var(--step-1);
    color: var(--muted);
    font-weight: 700;
  }

  .time-badge__duration {
    font-family: var(--font-mono);
    font-size: var(--step--1);
    font-weight: 800;
    color: var(--sky-strong);
    background: var(--sky-soft);
    padding: 2px 8px;
    border: 1px solid var(--sky);
  }

  .date-adjust {
    max-width: 280px;
    margin: 0 auto;
    width: 100%;
  }

  /* ── Settings Section ── */
  .settings-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  /* ── Compact Settings Row ── */
  .compact-settings-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: var(--space-4);
    border-top: 1px solid var(--line-light);
    padding-block-start: var(--space-4);
  }

  .compact-field {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .compact-field__label {
    font-weight: 800;
    font-size: var(--step--1);
    color: var(--ink);
  }

  .compact-input-wrap {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .compact-input {
    min-height: 44px;
    width: 72px;
    border: var(--border);
    background: var(--white);
    color: var(--ink);
    padding: var(--space-2) var(--space-2);
    font: inherit;
    font-weight: 800;
    font-size: var(--step-0);
    text-align: center;
    font-family: var(--font-mono);
  }

  .compact-input:focus {
    outline: none;
    border-color: var(--sky-strong);
  }

  .compact-suffix {
    font-size: var(--step--1);
    font-weight: 700;
    color: var(--muted);
  }

  .compact-field--readonly {
    justify-content: flex-start;
  }

  .one-on-one-badge {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    background: color-mix(in oklch, var(--sky-soft) 40%, transparent);
    color: var(--ink);
    border: 1px solid var(--sky);
    padding: var(--space-2) var(--space-3);
    font-weight: 800;
    font-size: var(--step--1);
    width: fit-content;
    min-height: 44px;
  }

  /* ── Equipment ── */
  .equipment-section {
    padding-block: var(--space-2);
  }

  /* ── Actions ── */
  .form-actions {
    display: flex;
    justify-content: flex-end;
    margin-block-start: var(--space-2);
  }
</style>
