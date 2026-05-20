<script lang="ts">
  import Button from "$components/ui/Button.svelte";
  import DatePicker from "$components/ui/DatePicker.svelte";
  import NativeTimePicker from "$components/ui/NativeTimePicker.svelte";
  import EquipmentPicker from "$components/ui/EquipmentPicker.svelte";
  import RadioGroup from "$components/ui/RadioGroup.svelte";
  import Slider from "$components/ui/Slider.svelte";
  import FormSection from "$features/app/components/FormSection.svelte";
  import type { Equipment } from "$lib/labels";
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
  let timeValue = $state("09:00");

  // Computed end time display
  const endTimeDisplay = $derived.by(() => {
    if (!startsAtLocal) return "--:--";
    const [_, timePart] = startsAtLocal.split("T");
    if (!timePart) return "--:--";
    const [h, m] = timePart.split(":").map(Number);
    const start = new Date(2000, 0, 1, h, m);
    const end = new Date(start.getTime() + durationMinutes * 60000);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(end.getHours())}:${pad(end.getMinutes())}`;
  });

  // Sync dateValue + timeValue → startsAtLocal
  function updateStartsAtLocal() {
    if (!dateValue) return;
    try {
      const time = parseTime(timeValue);
      const dateTime = toCalendarDateTime(dateValue as CalendarDate, time);
      startsAtLocal = dateTime.toString().slice(0, 16);
    } catch {
      // ignore invalid time
    }
  }

  // Sync startsAtLocal → dateValue + timeValue
  $effect(() => {
    if (!startsAtLocal) return;
    const [datePart, timePart] = startsAtLocal.split("T");
    if (!datePart || !timePart) return;
    try {
      const parsedDate = parseDate(datePart);
      if (!dateValue || parsedDate.toString() !== dateValue.toString()) {
        dateValue = parsedDate;
      }
      const trimmedTime = timePart.slice(0, 5);
      if (timeValue !== trimmedTime) {
        timeValue = trimmedTime;
      }
    } catch {
      // Safe fallback
    }
  });
</script>

<form onsubmit={(event) => { event.preventDefault(); onSubmit(); }}>
  <div class="studio-form-columns">
    <!-- Left Column: Scheduling -->
    <div class="studio-form-column">
      <FormSection title="תאריך ושעה">
        <DatePicker label="תאריך" bind:value={dateValue} onchange={updateStartsAtLocal} />

        <div class="time-row">
          <NativeTimePicker label="שעת התחלה" bind:value={timeValue} onchange={updateStartsAtLocal} />
          <div class="end-time-display">
            <span class="end-time-label">עד</span>
            <span class="end-time-value">{endTimeDisplay}</span>
          </div>
        </div>

        <div class="duration-row">
          <Slider label="משך (דקות)" bind:value={durationMinutes} min={15} max={180} step={5} />
          <span class="duration-badge">{durationMinutes} דק׳</span>
        </div>
      </FormSection>
    </div>

    <!-- Right Column: Settings -->
    <div class="studio-form-column">
      <FormSection title="הגדרות שיעור">
        <RadioGroup class="live-type-switch" bind:value={liveType} options={liveTypeOptions} />

        <div class="hb-input-field">
          <span class="hb-input-field__label">כותרת</span>
          <input class="hb-input" bind:value={title} required maxlength="120" placeholder="למשל: פילאטיס מזרן דינמי" />
        </div>

        <div class="hb-input-field">
          <span class="hb-input-field__label">תיאור</span>
          <textarea class="hb-textarea" bind:value={description} rows="3" maxlength="500" placeholder="פרטים על קצב השיעור, מיקוד גופני או דגשים..."></textarea>
        </div>

        <div class="sliders-stack">
          <Slider label="פתיחת כניסה (דקות לפני)" bind:value={joinOpensMinutesBefore} min={0} max={60} step={5} />

          {#if liveType === "group_live"}
            <Slider label="קיבולת (מקומות)" bind:value={capacity} min={1} max={12} step={1} />
          {:else}
            <div class="one-on-one-capacity">
              <span class="hb-input-field__label">קיבולת</span>
              <span class="one-on-one-badge">1 משתתפת (אישי)</span>
            </div>
          {/if}
        </div>
      </FormSection>
    </div>
  </div>

  <div class="picker-section">
    <EquipmentPicker bind:selected={requiredEquipment} label="ציוד חובה לשיעור" />
  </div>

  <div class="form-actions">
    <Button tone="ink" type="submit" disabled={pending || requiredEquipment.length === 0}>
      {pending ? "יוצרות..." : "לתזמן לייב"}
    </Button>
  </div>
</form>

<style>
  form {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  .studio-form-columns {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-5);
    align-items: stretch;
  }

  .studio-form-column {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .studio-form-column > :global(.form-section) {
    flex: 1;
  }

  .time-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-3);
    align-items: end;
  }

  .end-time-display {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    min-width: 0;
  }

  .end-time-label {
    font-size: var(--step--2);
    color: var(--muted);
    font-family: var(--font-mono);
    font-weight: 900;
    text-transform: uppercase;
  }

  .end-time-value {
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: var(--border);
    background: var(--surface);
    color: var(--muted);
    font-family: var(--font-mono);
    font-weight: 800;
    font-size: var(--step-0);
    direction: ltr;
  }

  .duration-row {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .duration-badge {
    font-family: var(--font-mono);
    font-size: var(--step--1);
    font-weight: 800;
    color: var(--sky-strong);
    white-space: nowrap;
    flex-shrink: 0;
  }

  :global(.live-type-switch) {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-3);
  }

  :global(.live-type-switch .hb-choice) {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    min-width: 0;
    padding: var(--space-4);
  }

  .sliders-stack {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    border-top: 1px solid var(--line-light);
    padding-block-start: var(--space-4);
  }

  .one-on-one-capacity {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    min-height: 44px;
    justify-content: center;
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
  }

  .picker-section {
    padding: var(--space-3) 0;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    margin-block-start: var(--space-2);
  }

  @media (max-width: 1024px) {
    .studio-form-columns {
      grid-template-columns: 1fr;
    }
  }
</style>
