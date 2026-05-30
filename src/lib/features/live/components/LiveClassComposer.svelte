<script lang="ts">
  import { Button, ScrollArea, ToggleGroup } from "bits-ui";
  import DatePicker from "$components/ui/DatePicker.svelte";
  import EquipmentPicker from "$components/ui/EquipmentPicker.svelte";
  import type { Equipment } from "$lib/labels";
  import { TextareaAutosize, Previous } from "runed";
  import { parseDate } from "@internationalized/date";
  import type { DateValue } from "@internationalized/date";

  let {
    layout = "default",
    mode = "full",
    intent = "create",
    editStatus,
    editClassType,
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
    onCancel,
    onDelete,
    onEndLive,
  }: {
    layout?: "default" | "popover";
    mode?: "quick" | "full";
    intent?: "create" | "edit";
    editStatus?: "scheduled" | "live" | "ended" | "draft" | "cancelled";
    editClassType?: "group_live" | "one_on_one";
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
    onCancel?: () => void;
    onDelete?: () => void;
    onEndLive?: () => void;
  } = $props();

  const isPopover = $derived(layout === "popover");
  const isEdit = $derived(intent === "edit");
  const isEnded = $derived(isEdit && editStatus === "ended");
  const lockedType = $derived(editClassType ?? liveType);
  const showTypeToggle = $derived(!isEdit && mode === "quick");

  let titleInput = $state<HTMLInputElement | null>(null);
  let showDescription = $state(false);
  let confirmCancel = $state(false);

  let dateValue = $state<DateValue | undefined>(undefined);
  let startTime = $state("07:00");
  let endTime = $state("08:00");
  let descEl = $state<HTMLTextAreaElement | null>(null);
  const descAutosize = new TextareaAutosize({
    element: () => descEl ?? undefined,
    input: () => description,
  });

  const shortDateFormatter = new Intl.DateTimeFormat("he-IL", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Asia/Jerusalem",
  });

  $effect(() => {
    const current = startsAtLocal;
    if (!current) return;
    const [datePart, timePart] = current.split("T");
    if (datePart) {
      try {
        dateValue = parseDate(datePart);
      } catch {
        /* keep current */
      }
    }
    if (timePart) {
      startTime = timePart;
      const [h, m] = timePart.split(":").map(Number);
      const startMin = h * 60 + m;
      const endMin = startMin + durationMinutes;
      endTime = minutesToTime(endMin);
    }
  });

  $effect(() => {
    if (requiredEquipment.length === 0) {
      requiredEquipment = ["mat"];
    }
  });

  $effect(() => {
    if (mode !== "quick" || !titleInput) return;
    titleInput.focus();
  });

  $effect(() => {
    if (mode === "full" && description.trim().length > 0) showDescription = true;
  });

  $effect(() => {
    if (mode === "quick" && description.trim().length > 0) showDescription = true;
  });

  $effect(() => {
    void editStatus;
    void intent;
    confirmCancel = false;
  });

  const prevStartTime = new Previous(() => startTime, "");
  $effect(() => {
    const currentStart = startTime;
    const prev = prevStartTime.current ?? "";
    if (currentStart === prev) return;
    const oldStartMin = timeToMinutes(prev || currentStart);
    const newStartMin = timeToMinutes(currentStart);
    const oldEndMin = timeToMinutes(endTime);
    const duration = oldEndMin - oldStartMin;
    endTime = minutesToTime(newStartMin + (duration > 0 ? duration : durationMinutes || 50));
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

  const formattedDate = $derived(
    dateValue ? shortDateFormatter.format(new Date(dateValue.toString())) : "בחרו תאריך",
  );
  const computedDuration = $derived(computeDuration());
  const durationLabel = $derived(`${computedDuration} דק׳`);

  const canSubmit = $derived(
    mode === "quick"
      ? Boolean(title.trim() && dateValue && requiredEquipment.length > 0)
      : Boolean(dateValue && requiredEquipment.length > 0),
  );

  function setType(type: "group_live" | "one_on_one") {
    liveType = type;
    if (type === "one_on_one") {
      capacity = 1;
      durationMinutes = 45;
      if (dateValue && startTime) {
        const [h, m] = startTime.split(":").map(Number);
        const endMin = h * 60 + m + 45;
        endTime = minutesToTime(endMin);
      }
    }
  }

  function syncPropsFromFields() {
    if (!dateValue) return;
    startsAtLocal = `${dateValue.toString()}T${startTime}`;
    durationMinutes = computeDuration();
  }

  function handleSubmit(e: Event) {
    e.preventDefault();
    if (!dateValue) return;
    syncPropsFromFields();
    onSubmit();
  }

  function handleWhenChange() {
    syncPropsFromFields();
  }

  function requestDelete() {
    confirmCancel = true;
  }

  function confirmDelete() {
    confirmCancel = false;
    onDelete?.();
  }

  function dismissDeleteConfirm() {
    confirmCancel = false;
  }

  const submitLabel = $derived(
    pending
      ? isEdit
        ? "מעדכן..."
        : "יוצרות..."
      : isEdit
        ? "שמירה"
        : mode === "quick"
          ? "שמירה"
          : "לתזמן לייב",
  );

  const showDismissButton = $derived(Boolean(onCancel) && !isPopover);

  const footerColumnCount = $derived.by(() => {
    if (confirmCancel) return 2;
    if (isEdit && editStatus === "live") {
      return onDelete ? 2 : 1;
    }
    const hasCancelClass = isEdit && onDelete && editStatus === "scheduled";
    if (hasCancelClass) return 2;
    if (showDismissButton) return 2;
    return 1;
  });
</script>

<form
  onsubmit={handleSubmit}
  class="live-composer"
  class:live-composer--quick={mode === "quick"}
  class:live-composer--popover={isPopover}
>
  {#if isEnded}
    <div class="live-composer__ended">
      <p class="live-composer__ended-title">{title}</p>
      <p class="live-composer__ended-hint">הסתיים — צפייה בלבד</p>
    </div>
    {#if !isPopover}
      <div
        class="live-composer__footer"
        class:live-composer__footer--cols-1={true}
      >
        <Button.Root
          class="hb-button hb-button--ink live-composer__footer-action"
          type="button"
          onclick={() => onCancel?.()}
        >
          סגירה
        </Button.Root>
      </div>
    {/if}
  {:else}
    {#snippet composerBody()}
      {#if mode === "quick"}
      <!-- Row 1: Title -->
      <input
        id="composer-title"
        class="hb-input live-composer__title-input"
        bind:value={title}
        bind:this={titleInput}
        required
        maxlength="120"
        placeholder="שם השיעור לייב"
        disabled={pending}
        aria-label="כותרת השיעור"
      />

      <!-- Row 2: When -->
      <div class="quick-when-row" aria-label="מועד השיעור">
        <div class="quick-date-chip">
          <DatePicker label="" bind:value={dateValue} disabled={pending} />
          <span class="quick-date-chip__label">{formattedDate}</span>
        </div>
        <div class="quick-time-range">
          <input
            type="time"
            class="hb-input quick-time-input"
            bind:value={startTime}
            step="60"
            disabled={pending}
            aria-label="שעת התחלה"
            onchange={handleWhenChange}
          />
          <span class="quick-time-sep" aria-hidden="true">–</span>
          <input
            type="time"
            class="hb-input quick-time-input"
            bind:value={endTime}
            step="60"
            disabled={pending}
            aria-label="שעת סיום"
            onchange={handleWhenChange}
          />
        </div>
        <span class="quick-duration-hint" aria-label="משך השיעור">{durationLabel}</span>
      </div>

      <!-- Row 3: Type -->
      {#if showTypeToggle}
        <ToggleGroup.Root
          type="single"
          value={liveType}
          onValueChange={(v) => {
            if (v === "group_live" || v === "one_on_one") setType(v);
          }}
          class="live-type-toggle live-type-toggle--quick"
          aria-label="סוג שיעור"
        >
          <ToggleGroup.Item value="group_live" class="live-type-toggle__item" disabled={pending}>
            קבוצתי
          </ToggleGroup.Item>
          <ToggleGroup.Item value="one_on_one" class="live-type-toggle__item" disabled={pending}>
            1:1
          </ToggleGroup.Item>
        </ToggleGroup.Root>
      {:else if isEdit}
        <span
          class="quick-type-badge"
          class:quick-type-badge--group={lockedType === "group_live"}
          class:quick-type-badge--one-on-one={lockedType === "one_on_one"}
        >
          {lockedType === "one_on_one" ? "1:1" : "קבוצתי"}
        </span>
      {/if}

      <!-- Row 4: Equipment -->
      <div class="live-composer__equipment">
        <EquipmentPicker compact bind:selected={requiredEquipment} disabled={pending} />
      </div>

      <!-- Row 5: Capacity (group only) -->
      {#if lockedType === "group_live"}
        <label class="quick-capacity-row" for="composer-capacity">
          <span class="quick-capacity-row__label">קיבולת</span>
          <input
            id="composer-capacity"
            type="number"
            class="hb-input quick-capacity-input"
            bind:value={capacity}
            min="1"
            max="50"
            step="1"
            disabled={pending}
          />
        </label>
      {/if}

      <!-- Row 6: Description (collapsed) -->
      {#if !showDescription}
        <Button.Root
          class="hb-button hb-button--ghost composer-desc-toggle"
          type="button"
          disabled={pending}
          onclick={() => (showDescription = true)}
        >
          + תיאור לתלמידות
        </Button.Root>
      {:else}
        <textarea
          id="composer-desc-quick"
          class="hb-textarea composer-desc composer-desc--quick"
          bind:value={description}
          bind:this={descEl}
          maxlength="500"
          rows="2"
          placeholder="קצב, מיקוד, ציוד…"
          disabled={pending}
          aria-label="תיאור לתלמידות"
        ></textarea>
      {/if}
    {:else}
      <div class="form-field">
        <label class="field-label" for="composer-title-full">כותרת השיעור</label>
        <input
          id="composer-title-full"
          class="hb-input"
          bind:value={title}
          required
          maxlength="120"
          placeholder="למשל: פילאטיס מזרן דינמי"
          disabled={pending}
        />
      </div>

      <div class="form-field">
        <span class="field-label" id="composer-type-label">סוג שיעור</span>
        <ToggleGroup.Root
          type="single"
          value={liveType}
          onValueChange={(v) => {
            if (v === "group_live" || v === "one_on_one") setType(v);
          }}
          class="live-type-toggle"
          aria-labelledby="composer-type-label"
        >
          <ToggleGroup.Item value="group_live" class="live-type-toggle__item" disabled={pending}>
            <span class="material-symbols-rounded" aria-hidden="true">groups</span>
            <span>קבוצתי</span>
          </ToggleGroup.Item>
          <ToggleGroup.Item value="one_on_one" class="live-type-toggle__item" disabled={pending}>
            <span class="material-symbols-rounded" aria-hidden="true">person</span>
            <span>1:1</span>
          </ToggleGroup.Item>
        </ToggleGroup.Root>
      </div>

      <div class="form-field">
        <span class="field-label">מועד</span>
        <div class="datetime-row">
          <div class="date-field">
            <DatePicker label="" bind:value={dateValue} disabled={pending} />
            <span class="date-display">{formattedDate}</span>
          </div>
          <label class="time-field">
            <span class="time-label">התחלה</span>
            <input type="time" class="hb-input" bind:value={startTime} step="60" disabled={pending} />
          </label>
          <label class="time-field">
            <span class="time-label">סיום</span>
            <input type="time" class="hb-input" bind:value={endTime} step="60" disabled={pending} />
          </label>
          <div class="duration-badge">{durationLabel}</div>
        </div>
      </div>

      <div class="form-field">
        <span class="field-label">ציוד נדרש</span>
        <EquipmentPicker bind:selected={requiredEquipment} disabled={pending} />
      </div>

      {#if liveType === "group_live"}
        <div class="form-field form-field--narrow">
          <label class="field-label" for="composer-capacity-full">קיבולת</label>
          <input
            id="composer-capacity-full"
            type="number"
            class="hb-input"
            bind:value={capacity}
            min="1"
            max="50"
            step="1"
            disabled={pending}
          />
        </div>
      {:else}
        <p class="capacity-locked" aria-live="polite">שיעור 1:1 — משתתפת אחת</p>
      {/if}

      <div class="settings-row">
        <label class="settings-field">
          <span class="settings-label">פתיחה (דק׳ לפני)</span>
          <input
            type="number"
            class="hb-input"
            bind:value={joinOpensMinutesBefore}
            min="0"
            max="60"
            step="5"
            disabled={pending}
          />
        </label>
      </div>

      <div class="form-field">
        {#if !showDescription}
          <Button.Root
            class="hb-button hb-button--ghost composer-desc-toggle"
            type="button"
            disabled={pending}
            onclick={() => (showDescription = true)}
          >
            <span class="material-symbols-rounded" aria-hidden="true">add</span>
            תיאור (אופציונלי)
          </Button.Root>
        {:else}
          <label class="field-label" for="composer-desc">
            תיאור <span class="field-optional">(אופציונלי)</span>
          </label>
          <textarea
            id="composer-desc"
            class="hb-textarea composer-desc"
            bind:value={description}
            bind:this={descEl}
            maxlength="500"
            rows="2"
            placeholder="קצב, מיקוד, דגשים…"
            disabled={pending}
          ></textarea>
        {/if}
      </div>
    {/if}
    {/snippet}

    {#if isPopover}
      <div class="live-composer__scroll">
        <ScrollArea.Root class="hb-scroll-area">
          <ScrollArea.Viewport class="hb-scroll-area__viewport live-composer__body">
            {@render composerBody()}
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar class="hb-scroll-area__bar" orientation="vertical">
            <ScrollArea.Thumb class="hb-scroll-area__thumb" />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>
      </div>
    {:else}
      <div class="live-composer__body">
        {@render composerBody()}
      </div>
    {/if}

    <div
      class="live-composer__footer"
      class:live-composer__footer--popover={isPopover}
      class:live-composer__footer--cols-1={footerColumnCount === 1}
      class:live-composer__footer--cols-2={footerColumnCount === 2}
    >
      {#if confirmCancel}
        <p class="live-composer__confirm-text" role="status">
          לבטל את השיעור? ההרשמות יזוכו בקרדיט.
        </p>
        <Button.Root
          class="hb-button hb-button--ghost hb-button--md live-composer__footer-action"
          type="button"
          disabled={pending}
          onclick={dismissDeleteConfirm}
        >
          חזרה לעריכה
        </Button.Root>
        <Button.Root
          class="hb-button hb-button--danger hb-button--md live-composer__footer-action"
          type="button"
          disabled={pending}
          onclick={confirmDelete}
        >
          {pending ? "מבטלת..." : "כן, לבטל"}
        </Button.Root>
      {:else if isEdit && editStatus === "live"}
        <Button.Root
          class="hb-button hb-button--ink hb-button--md live-composer__footer-action"
          type="button"
          disabled={pending}
          onclick={() => onEndLive?.()}
        >
          לסיים שידור
        </Button.Root>
        {#if onDelete}
          <Button.Root
            class="hb-button hb-button--danger hb-button--md live-composer__footer-action"
            type="button"
            disabled={pending}
            onclick={requestDelete}
          >
            ביטול שיעור
          </Button.Root>
        {/if}
      {:else}
        <Button.Root
          class="hb-button hb-button--ink hb-button--md live-composer__footer-action"
          type="submit"
          disabled={pending || !canSubmit}
        >
          {submitLabel}
        </Button.Root>
        {#if isEdit && onDelete && editStatus === "scheduled"}
          <Button.Root
            class="hb-button hb-button--danger hb-button--md live-composer__footer-action"
            type="button"
            disabled={pending}
            onclick={requestDelete}
          >
            ביטול שיעור
          </Button.Root>
        {/if}
        {#if showDismissButton}
          <Button.Root
            class="hb-button hb-button--ghost live-composer__footer-action"
            type="button"
            disabled={pending}
            onclick={onCancel}
          >
            ביטול
          </Button.Root>
        {/if}
      {/if}
    </div>
  {/if}
</form>

<style>
  .live-composer {
    display: flex;
    flex-direction: column;
    gap: 0;
    min-height: 0;
  }

  .live-composer--quick {
    gap: var(--space-2);
  }

  .live-composer--popover {
    max-height: min(calc(100dvh - 24px), 720px);
    padding: 0;
    gap: 0;
  }

  .live-composer__scroll {
    flex: 1 1 auto;
    min-height: 0;
    max-height: min(calc(100dvh - 200px), 520px);
    padding: 0;
  }

  .live-composer__scroll :global(.hb-scroll-area) {
    height: 100%;
  }

  .live-composer__scroll :global(.hb-scroll-area__viewport) {
    scrollbar-gutter: stable;
  }

  .live-composer__scroll :global(.hb-scroll-area__bar) {
    width: 6px;
    padding: 2px;
    background: transparent;
  }

  .live-composer__scroll :global(.hb-scroll-area__thumb) {
    background: var(--line-light);
    border-radius: 999px;
  }

  .live-composer__body {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding-bottom: var(--space-2);
  }

  .live-composer--quick .live-composer__body {
    gap: var(--space-3);
  }

  .live-composer--popover .live-composer__body {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
    padding: var(--space-5) var(--space-5) var(--space-4);
    text-align: right;
    align-items: stretch;
    box-sizing: border-box;
  }

  .live-composer__footer {
    display: grid;
    gap: var(--space-2);
    align-items: stretch;
    flex-shrink: 0;
    padding-top: var(--space-3);
    margin-top: var(--space-2);
    border-top: 1px solid var(--line-light);
    background: inherit;
  }

  .live-composer__footer--cols-1 {
    grid-template-columns: 1fr;
    justify-items: stretch;
  }

  .live-composer__footer--cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: var(--space-2);
  }

  .live-composer__footer--popover.live-composer__footer--cols-1
    :global(.live-composer__footer-action:only-of-type),
  .live-composer__footer--popover.live-composer__footer--cols-1
    :global(.live-composer__footer-action) {
    grid-column: 1 / -1;
  }

  .live-composer__footer--popover {
    gap: var(--space-2);
    padding: var(--space-4) var(--space-5) var(--space-5);
    margin-top: 0;
    justify-items: stretch;
    width: 100%;
    box-sizing: border-box;
  }

  .live-composer__footer--popover :global(.live-composer__footer-action) {
    display: flex;
    width: 100%;
    max-width: none;
    min-height: 48px;
    margin: 0;
    padding-inline: var(--space-4);
    font-size: var(--step--1);
    box-sizing: border-box;
    justify-content: center;
    align-self: stretch;
  }

  .live-composer__footer:not(.live-composer__footer--popover) {
    grid-auto-flow: column;
    grid-auto-columns: max-content;
    justify-content: end;
  }

  .live-composer__footer:not(.live-composer__footer--popover) :global(.live-composer__footer-action) {
    width: auto;
  }

  .live-composer--popover :global(.hb-input:focus),
  .live-composer--popover :global(.hb-textarea:focus) {
    box-shadow: none;
    outline: 2px solid var(--accent);
    outline-offset: 0;
  }

  .live-composer__confirm-text {
    grid-column: 1 / -1;
    margin: 0 0 var(--space-1);
    font-size: var(--step--1);
    font-weight: 700;
    color: var(--danger);
    line-height: 1.45;
    text-align: center;
  }

  .live-composer__ended {
    padding: var(--space-2) 0 var(--space-3);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .live-composer__ended-title {
    margin: 0;
    font-size: var(--step-0);
    font-weight: 900;
    color: var(--ink);
  }

  .live-composer__ended-hint {
    margin: 0;
    font-size: var(--step--1);
    color: var(--foreground-muted);
  }

  .live-composer--quick .live-composer__title-input {
    min-height: 40px;
    font-weight: 800;
    font-size: var(--step-0);
    border: none;
    border-bottom: 2px solid var(--line-light);
    border-radius: 0;
    padding-inline: 0;
    background: transparent;
  }

  .live-composer--popover .live-composer__title-input {
    min-height: 44px;
    padding-block: var(--space-1) var(--space-3);
    margin-bottom: var(--space-1);
    font-weight: 800;
    font-size: var(--step-0);
    line-height: 1.35;
    border: none;
    border-bottom: 2px solid var(--line-light);
    border-radius: 0;
    padding-inline: 0;
    background: transparent;
    text-align: right;
    width: 100%;
    box-sizing: border-box;
  }

  .live-composer--popover .live-composer__title-input:focus {
    border-bottom-color: var(--accent);
    outline: none;
    box-shadow: none;
  }

  .quick-type-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    justify-self: end;
    min-height: 28px;
    padding: 0 var(--space-3);
    border-radius: 999px;
    font-size: var(--step--2);
    font-weight: 800;
    border: 1px solid var(--line-light);
    background: var(--surface);
  }

  .quick-type-badge--group {
    border-color: color-mix(in oklch, var(--accent) 55%, var(--line-light));
    color: var(--accent);
    background: color-mix(in oklch, var(--accent) 14%, var(--paper));
  }

  .quick-type-badge--one-on-one {
    border-color: color-mix(in oklch, var(--primary) 55%, var(--line-light));
    color: var(--primary);
    background: color-mix(in oklch, var(--primary) 12%, var(--paper));
  }

  :global(.composer-desc-toggle) {
    justify-content: flex-end;
    justify-self: stretch;
    width: 100%;
    padding-inline: 0;
    min-height: 32px;
    font-weight: 700;
    color: var(--accent);
  }

  .composer-desc--quick {
    min-height: 3.5rem;
    resize: vertical;
  }

  .quick-when-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, auto) minmax(3.25rem, auto);
    align-items: center;
    gap: var(--space-2);
    width: 100%;
  }

  .quick-time-range {
    display: grid;
    grid-template-columns: minmax(4.25rem, 1fr) auto minmax(4.25rem, 1fr);
    align-items: center;
    gap: var(--space-1);
    min-width: 0;
  }

  .live-composer--popover .quick-when-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3) var(--space-4);
    padding: var(--space-3) var(--space-4);
    background: var(--surface);
    border-radius: 8px;
    border: none;
    direction: rtl;
  }

  .quick-date-chip {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    min-height: 32px;
    padding: 0;
    background: transparent;
    border: none;
    border-radius: 0;
    position: relative;
  }

  .live-composer--popover .quick-date-chip {
    flex: 1 1 100%;
    padding-bottom: var(--space-1);
    border-bottom: 1px solid var(--line-light);
  }

  .quick-date-chip :global(.hb-date-picker) {
    gap: 0;
    position: absolute;
    inset: 0;
    opacity: 0;
  }

  .quick-date-chip :global(.hb-date-picker__label) {
    display: none;
  }

  .quick-date-chip :global(.hb-date-picker button) {
    width: 100%;
    height: 100%;
    cursor: pointer;
  }

  .quick-date-chip__label {
    font-size: var(--step--2);
    font-weight: 800;
    color: var(--ink);
    white-space: nowrap;
    pointer-events: none;
  }

  .quick-time-input {
    width: 5.5rem;
    min-height: 32px;
    padding: var(--space-1) var(--space-2);
    font-family: var(--font-mono);
    font-size: var(--step--2);
    font-weight: 700;
  }

  .live-composer--popover .quick-time-range {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    flex: 1 1 auto;
  }

  .live-composer--popover .quick-time-input {
    width: auto;
    min-width: 4.75rem;
    flex: 1 1 0;
    border: none;
    background: transparent;
    padding: var(--space-1);
    box-shadow: none;
  }

  .live-composer--popover .quick-time-input:focus {
    outline: none;
    background: color-mix(in oklch, var(--paper) 70%, transparent);
    border-radius: 4px;
  }

  .quick-time-sep {
    color: var(--foreground-muted);
    font-weight: 700;
    font-size: var(--step--2);
  }

  .quick-duration-hint {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 32px;
    padding: 0;
    font-family: var(--font-mono);
    font-size: var(--step--2);
    font-weight: 700;
    color: var(--foreground-muted);
    white-space: nowrap;
    background: transparent;
    border: none;
    justify-self: end;
  }

  .live-composer--popover .quick-duration-hint {
    flex: 0 0 auto;
    margin-inline-start: auto;
  }

  .live-composer--popover .quick-duration-hint::before {
    content: "·";
    margin-inline-end: var(--space-2);
    color: var(--line);
  }

  .quick-capacity-row {
    display: grid;
    grid-template-columns: auto minmax(4rem, 5rem);
    align-items: center;
    justify-content: end;
    justify-items: end;
    gap: var(--space-2);
    width: 100%;
  }

  .quick-capacity-row__label {
    font-size: var(--step--2);
    font-weight: 800;
    color: var(--foreground-muted);
    white-space: nowrap;
  }

  .quick-capacity-input {
    width: 4rem;
    min-height: 32px;
    padding: var(--space-1) var(--space-2);
    font-family: var(--font-mono);
    font-weight: 800;
    font-size: var(--step--2);
  }

  :global(.live-type-toggle--quick) {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-2);
    width: 100%;
  }

  :global(.live-type-toggle--quick .live-type-toggle__item) {
    min-height: 36px;
    padding: var(--space-1) var(--space-3);
    font-size: var(--step--1);
    width: 100%;
  }

  .live-composer--popover :global(.live-type-toggle--quick) {
    gap: var(--space-1);
    padding: var(--space-1);
    background: var(--surface);
    border-radius: 8px;
    border: none;
  }

  .live-composer--popover :global(.live-type-toggle--quick .live-type-toggle__item) {
    min-height: 40px;
    border: none;
    background: transparent;
    border-radius: 6px;
  }

  .live-composer--popover :global(.live-type-toggle--quick .live-type-toggle__item[data-state="on"]) {
    background: color-mix(in oklch, var(--accent) 22%, var(--surface));
    color: var(--ink);
    box-shadow: none;
  }

  .live-composer--popover
    :global(.live-type-toggle--quick .live-type-toggle__item[data-state="on"][data-value="one_on_one"]) {
    background: color-mix(in oklch, var(--primary) 18%, var(--paper));
    color: var(--primary);
  }

  .live-composer--popover .live-composer__equipment :global(.equipment-grid--compact) {
    gap: var(--space-2);
  }

  .live-composer--popover .live-composer__equipment :global(.equipment-grid--compact .hb-choice) {
    min-height: 52px;
    padding: var(--space-2) var(--space-1);
    border: none;
    background: var(--surface);
    border-radius: 8px;
    box-shadow: none;
  }

  .live-composer--popover
    .live-composer__equipment
    :global(.equipment-grid--compact .hb-choice[data-state="checked"]) {
    background: color-mix(in oklch, var(--accent) 18%, var(--paper));
    color: var(--ink);
    outline: 2px solid color-mix(in oklch, var(--accent) 55%, var(--line-light));
    outline-offset: -2px;
  }

  .live-composer--popover .live-composer__equipment :global(.equipment-grid--compact .hb-choice:hover:not([data-disabled])) {
    background: color-mix(in oklch, var(--surface) 80%, var(--paper));
    border-color: transparent;
  }

  .live-composer--popover .composer-desc--quick,
  .live-composer--popover .composer-desc {
    border-color: var(--line-light);
    background: var(--surface);
    border-radius: 8px;
    min-height: 4.5rem;
  }

  .live-composer--popover .quick-capacity-input {
    border: none;
    background: var(--surface);
    border-radius: 6px;
  }

  .form-field {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .form-field--narrow {
    max-width: 8rem;
  }

  .field-label {
    font-weight: 800;
    font-size: var(--step--1);
    color: var(--ink);
  }

  .field-optional {
    font-weight: 600;
    color: var(--foreground-muted);
  }

  .capacity-locked {
    margin: 0;
    padding: var(--space-2) var(--space-3);
    background: var(--surface);
    border: 1px solid var(--primary);
    border-radius: 4px;
    font-size: var(--step--1);
    font-weight: 700;
    color: var(--ink);
  }

  .composer-desc {
    min-height: 4rem;
    resize: vertical;
  }

  :global(.live-type-toggle) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-2);
    width: 100%;
  }

  :global(.live-type-toggle__item) {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    min-height: 44px;
    padding: var(--space-2) var(--space-3);
    border: var(--border);
    background: var(--elevated);
    color: var(--ink);
    font: inherit;
    font-weight: 800;
    font-size: var(--step--1);
    cursor: pointer;
    border-radius: 4px;
    transition:
      background 0.2s ease,
      border-color 0.2s ease,
      border-radius 0.35s ease,
      transform 0.08s ease;
  }

  :global(.live-type-toggle__item[data-state="on"]) {
    background: color-mix(in oklch, var(--accent) 22%, var(--elevated));
    border-color: var(--accent);
  }

  :global(.live-type-toggle__item[data-state="on"][data-value="one_on_one"]) {
    background: var(--surface);
    border-color: var(--primary);
  }

  :global(.live-type-toggle__item:hover:not([data-state="on"])) {
    background: var(--surface);
    border-color: color-mix(in oklch, var(--accent) 45%, var(--line-light));
  }

  :global(.live-type-toggle__item[data-state="on"]:hover) {
    box-shadow: 0 0 0 1px color-mix(in oklch, var(--accent) 55%, transparent);
  }

  :global(.live-type-toggle__item[data-state="on"][data-value="one_on_one"]:hover) {
    background: color-mix(in oklch, var(--primary) 10%, var(--surface));
    border-color: var(--primary);
    box-shadow: 0 0 0 1px color-mix(in oklch, var(--primary) 45%, transparent);
  }

  :global(.live-type-toggle__item .material-symbols-rounded) {
    font-size: var(--step-1);
  }

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
    color: var(--foreground-muted);
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
    color: var(--foreground-muted);
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
    color: var(--foreground-muted);
    white-space: nowrap;
  }

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
    color: var(--foreground-muted);
    font-family: var(--font-mono);
    text-transform: uppercase;
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
