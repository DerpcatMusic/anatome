<script lang="ts">
  import { Previous } from "runed";
  import { parseDate } from "@internationalized/date";
  import type { DateValue } from "@internationalized/date";
  import type { Equipment } from "$lib/labels";
  import ComposerEndedView from "./ComposerEndedView.svelte";
  import LiveClassComposerBody from "./LiveClassComposerBody.svelte";
  import LiveClassComposerFooter from "./LiveClassComposerFooter.svelte";

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

  let titleInput: HTMLInputElement | null = null;
  let showDescription = $state(false);
  let confirmCancel = $state(false);

  let dateValue = $state<DateValue | undefined>(undefined);
  let startTime = $state("07:00");
  let endTime = $state("08:00");

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

  function showDescriptionField() {
    showDescription = true;
  }

  function handleTypeChange(v: string) {
    if (v === "group_live" || v === "one_on_one") setType(v);
  }

  function handleCancel() {
    onCancel?.();
  }

  function handleEndLive() {
    onEndLive?.();
  }
</script>

<form
  onsubmit={handleSubmit}
  class="live-composer"
  class:live-composer--quick={mode === "quick"}
  class:live-composer--popover={isPopover}
>
  {#if isEnded}
    <ComposerEndedView {title} {isPopover} onCancel={handleCancel} />
  {:else}
    <LiveClassComposerBody
      {mode}
      {isPopover}
      {isEdit}
      {editClassType}
      {lockedType}
      {showTypeToggle}
      bind:title
      bind:description
      bind:liveType
      bind:dateValue
      bind:startTime
      bind:endTime
      {formattedDate}
      {durationLabel}
      bind:capacity
      bind:joinOpensMinutesBefore
      bind:requiredEquipment
      {pending}
      {showDescription}
      bind:titleInput
      onShowDescription={showDescriptionField}
      onTypeChange={handleTypeChange}
      onWhenChange={handleWhenChange}
    />

    <LiveClassComposerFooter
      {confirmCancel}
      {isEdit}
      {editStatus}
      hasDeleteHandler={Boolean(onDelete)}
      {pending}
      {submitLabel}
      {canSubmit}
      {showDismissButton}
      {isPopover}
      {footerColumnCount}
      onDismissDeleteConfirm={dismissDeleteConfirm}
      onConfirmDelete={confirmDelete}
      onEndLive={handleEndLive}
      onRequestDelete={requestDelete}
      onCancel={handleCancel}
    />
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
</style>
