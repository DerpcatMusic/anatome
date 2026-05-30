<script lang="ts">
  import { onMount, untrack } from "svelte";
  import { api } from "$convex/_generated/api";
  import type { FunctionReturnType } from "convex/server";
  import type { Id } from "$convex/_generated/dataModel";
  import { authQuery, initAuth, setCachedRole, canRunAuthenticatedQuery } from "$lib/auth/session.svelte";
  import { useQueryNowMs } from "$lib/convex/queryClock.svelte";
  import { useConvexClient, useQuery } from "convex-svelte";
  import { liveRoomHref } from "$lib/i18n/context";
  import { Button, Toggle, ToggleGroup } from "bits-ui";
  import LiveClassModalShell from "$features/live/components/LiveClassModalShell.svelte";
  import LiveEventPopover from "$features/live/components/LiveEventPopover.svelte";
  import OneOnOneRequestsPanel from "./OneOnOneRequestsPanel.svelte";
  import {
    createEmptyPainted,
    paintedEquals,
    rulesToPainted,
    type AvailabilityRule,
    type PaintedSlots,
  } from "$features/studio/lib/one-on-one-availability";
  import { saveAvailabilityFromPainted } from "$features/studio/lib/save-availability-rules";
  import {
    calendarVisibleClasses,
    isAutoPublishedOpenSlot,
  } from "$features/studio/lib/live-class-display";
  import type { Equipment } from "$lib/labels";
  import type { SelectionAnchor } from "$features/live/types/selection-anchor";
  import { anchorFromCalendarSelection } from "$features/live/types/selection-anchor";
  import {
    fromCalendarEventDate,
    nextAppHourDateTimeLocalString,
    parseDateTimeLocal,
    toCalendarEventDate,
    toDateTimeLocalString,
  } from "$lib/datetime/local";
  import { useDebounce } from "runed";

  type LiveClass = FunctionReturnType<typeof api.live.class.listMine>[number];
  type ClassTypeFilter = "all" | "group_live" | "one_on_one";

  const auth = initAuth();
  const queryNow = useQueryNowMs();
  const profileQuery = useQuery(api.profiles.viewer.get, () => (canRunAuthenticatedQuery() ? {} : "skip"));
  let calendarQueryRange = $state<{ from: number; to: number } | null>(null);
  const classesQuery = useQuery(api.live.class.listMine, () =>
    canRunAuthenticatedQuery()
      ? {
          now: queryNow.nowMs,
          ...(calendarQueryRange ?? {}),
        }
      : "skip",
  );

  const classes = $derived(classesQuery.data ?? []);
  const classesQueryError = $derived(classesQuery.error?.message ?? "");
  let hasLoadedClasses = $state(false);
  const loading = $derived(
    !canRunAuthenticatedQuery() ||
      profileQuery.isLoading ||
      (classesQuery.isLoading && !hasLoadedClasses),
  );

  let error = $state("");
  let actionId = $state<string | null>(null);

  let typeFilter = $state<ClassTypeFilter>("all");
  let pendingRequestCount = $state(0);

  let popoverOpen = $state(false);
  let popoverMode = $state<"create" | "edit">("create");
  let popoverAnchor = $state<SelectionAnchor | null>(null);
  let popoverEditClass = $state<LiveClass | null>(null);
  let showRequestsPanel = $state(false);
  let availabilityPaintMode = $state(false);
  let availabilityRules = $state<AvailabilityRule[]>([]);
  let availabilityPainted = $state<PaintedSlots>(createEmptyPainted());
  let availabilitySavedPainted = $state<PaintedSlots>(createEmptyPainted());
  let availabilitySaving = $state(false);
  let availabilityError = $state("");

  let title = $state("פילאטיס לייב");
  let description = $state("שיעור קטן עם תיקונים.");
  let liveType = $state<"group_live" | "one_on_one">("group_live");
  let startsAtLocal = $state(defaultStartsAtLocal());
  let durationMinutes = $state(50);
  let joinOpensMinutesBefore = $state(15);
  let capacity = $state(12);
  let requiredEquipment = $state<Equipment[]>(["mat"]);

  let requestsPanel = $state<{ refresh: () => Promise<void> } | undefined>(undefined);
  let weeklyAgenda = $state<{ clearCalendarSelection: () => void } | undefined>();

  const client = useConvexClient();

  /** Open 1:1 publish windows are hidden; type filtering happens in WeeklyAgenda. */
  const studioCalendarClasses = $derived(calendarVisibleClasses(classes));

  const quickCreatePreview = $derived(
    popoverOpen && popoverMode === "create" && startsAtLocal
      ? {
          startsAt: parseDateTimeLocal(startsAtLocal),
          endsAt: parseDateTimeLocal(startsAtLocal) + durationMinutes * 60 * 1000,
          requiredEquipment,
        }
      : null,
  );

  const popoverPending = $derived(
    actionId === "create" || actionId === "edit" || actionId === "cancel",
  );

  const availabilityDirty = $derived(
    !paintedEquals(availabilityPainted, availabilitySavedPainted),
  );

  const availabilityModeStatus = $derived(
    availabilitySaving
      ? "שומרת זמינות..."
      : availabilityDirty
        ? "שינויים נשמרים אוטומטית"
        : "הזמינות נשמרה",
  );

  let lastCreatedClassId = $state<Id<"liveClasses"> | null>(null);

  $effect(() => {
    if (classesQuery.data !== undefined) {
      hasLoadedClasses = true;
    }
  });

  $effect(() => {
    if (!canRunAuthenticatedQuery() || profileQuery.isLoading) return;
    const profile = profileQuery.data;
    if (profile === null || profile === undefined) {
      window.location.assign("/");
      return;
    }
    if (profile.role !== "admin" && profile.role !== "instructor") {
      window.location.assign("/u/calendar");
      return;
    }
    untrack(() => setCachedRole(profile.role));
  });

  function defaultStartsAtLocal() {
    return nextAppHourDateTimeLocalString();
  }

  function resetCreateForm() {
    title = "פילאטיס לייב";
    description =
      "שיעור קטן עם תיקונים.";
    liveType = "group_live";
    capacity = 12;
    joinOpensMinutesBefore = 15;
    requiredEquipment = ["mat"];
  }

  function populateFormFromClass(liveClass: LiveClass) {
    title = liveClass.title;
    description = liveClass.description ?? "";
    liveType = liveClass.type;
    startsAtLocal = toDateTimeLocalString(liveClass.startsAt);
    durationMinutes = Math.max(
      15,
      Math.round((liveClass.endsAt - liveClass.startsAt) / 60000),
    );
    joinOpensMinutesBefore = 15;
    capacity = liveClass.capacity;
    requiredEquipment =
      liveClass.requiredEquipment.length > 0 ? [...liveClass.requiredEquipment] : ["mat"];
  }

  function closePopover() {
    popoverOpen = false;
    popoverAnchor = null;
    popoverEditClass = null;
    weeklyAgenda?.clearCalendarSelection();
  }

  function openCreatePopover(anchor: SelectionAnchor) {
    popoverMode = "create";
    popoverEditClass = null;
    popoverAnchor = anchor;
    popoverOpen = true;
  }

  function openEditPopover(liveClass: LiveClass, anchor: SelectionAnchor) {
    popoverMode = "edit";
    popoverEditClass = liveClass;
    popoverAnchor = anchor;
    populateFormFromClass(liveClass);
    popoverOpen = true;
  }

  async function loadAvailability() {
    availabilityError = "";
    try {
      const loaded = (await authQuery(api.oneOnOne.instructor.listAvailability, {})) ?? [];
      availabilityRules = loaded;
      const painted = rulesToPainted(loaded);
      availabilityPainted = painted;
      availabilitySavedPainted = painted;
    } catch (reason) {
      availabilityError =
        reason instanceof Error ? reason.message : "לא הצלחנו לטעון זמינות 1:1.";
    }
  }

  async function retryLoad() {
    error = "";
    await loadAvailability();
  }

  async function saveAvailability() {
    if (!availabilityDirty) return;
    availabilitySaving = true;
    availabilityError = "";
    try {
      await saveAvailabilityFromPainted(client, availabilityPainted, availabilityRules);
      await loadAvailability();
    } catch (reason) {
      availabilityError =
        reason instanceof Error ? reason.message : "לא הצלחנו לשמור זמינות.";
    } finally {
      availabilitySaving = false;
    }
  }

  const scheduleAvailabilitySave = useDebounce(() => void saveAvailability(), 450);

  function handleAvailabilityPaintChange(next: PaintedSlots) {
    availabilityPainted = next;
    scheduleAvailabilitySave();
  }

  function toggleAvailabilityPaintMode(pressed: boolean) {
    availabilityPaintMode = pressed;
    weeklyAgenda?.clearCalendarSelection();
    if (availabilityPaintMode) {
      closePopover();
    } else if (availabilityDirty) {
      void saveAvailability();
    }
  }

  async function createClass() {
    error = "";
    actionId = "create";
    const startsAt = parseDateTimeLocal(startsAtLocal);
    try {
      const liveClassId = await client.mutation(api.live.class.create, {
        title,
        description,
        type: liveType,
        startsAt,
        durationMinutes: liveType === "one_on_one" ? 45 : durationMinutes,
        joinOpensMinutesBefore,
        capacity: liveType === "one_on_one" ? 1 : capacity,
        requiredEquipment: requiredEquipment.length > 0 ? requiredEquipment : ["mat"],
      });
      lastCreatedClassId = liveClassId;
      startsAtLocal = defaultStartsAtLocal();
      durationMinutes = 50;
      closePopover();
      resetCreateForm();
    } catch (reason) {
      error = reason instanceof Error ? reason.message : "לא הצלחנו ליצור לייב.";
    } finally {
      actionId = null;
    }
  }

  async function submitEdit() {
    if (!popoverEditClass) return;
    error = "";
    actionId = "edit";
    try {
      await client.mutation(api.live.class.reschedule, {
        liveClassId: popoverEditClass._id,
        startsAt: parseDateTimeLocal(startsAtLocal),
        durationMinutes: liveType === "one_on_one" ? 45 : durationMinutes,
        joinOpensMinutesBefore,
        capacity: liveType === "one_on_one" ? 1 : capacity,
        requiredEquipment: requiredEquipment.length > 0 ? requiredEquipment : ["mat"],
        title: title.trim(),
        description: description.trim(),
      });
      closePopover();
    } catch (reason) {
      error = reason instanceof Error ? reason.message : "לא הצלחנו לעדכן את השיעור.";
    } finally {
      actionId = null;
    }
  }

  async function submitCancellation() {
    if (!popoverEditClass) return;
    error = "";
    actionId = "cancel";
    try {
      await client.mutation(api.live.class.cancel, {
        liveClassId: popoverEditClass._id,
      });
      closePopover();
    } catch (reason) {
      error = reason instanceof Error ? reason.message : "לא הצלחנו לבטל את השיעור.";
    } finally {
      actionId = null;
    }
  }

  async function startLive(liveClassId: Id<"liveClasses">) {
    actionId = liveClassId;
    error = "";
    try {
      await client.mutation(api.live.class.start, { liveClassId });
      window.location.assign(liveRoomHref(liveClassId));
    } catch (reason) {
      error = reason instanceof Error ? reason.message : "לא הצלחנו להתחיל את הלייב.";
    } finally {
      actionId = null;
    }
  }

  async function endLive(liveClassId: Id<"liveClasses">) {
    actionId = liveClassId;
    error = "";
    try {
      await client.mutation(api.live.class.end, { liveClassId });
      closePopover();
    } catch (reason) {
      error = reason instanceof Error ? reason.message : "לא הצלחנו לסיים את הלייב.";
    } finally {
      actionId = null;
    }
  }

  function handleSelectSlot(timeLocalString: string, slotDurationMinutes: number, anchor?: SelectionAnchor) {
    closePopover();
    startsAtLocal = timeLocalString;
    durationMinutes = slotDurationMinutes;
    if (requiredEquipment.length === 0) requiredEquipment = ["mat"];

    const container = document.querySelector(".weekly-agenda-container") as HTMLElement | null;
    const startMs = parseDateTimeLocal(timeLocalString);
    let nextAnchor =
      anchor ??
      anchorFromCalendarSelection(
        container,
        toCalendarEventDate(startMs),
        toCalendarEventDate(startMs + slotDurationMinutes * 60 * 1000),
      );

    openCreatePopover(nextAnchor);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const previewEl = document.querySelector(".ec-quick-create-preview");
        if (!(previewEl instanceof HTMLElement)) return;
        const rect = previewEl.getBoundingClientRect();
        if (rect.width <= 0 && rect.height <= 0) return;
        popoverAnchor = {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        };
      });
    });
  }

  function handleCreatePreviewChange(startsAt: number, endsAt: number) {
    startsAtLocal = toDateTimeLocalString(startsAt);
    durationMinutes = Math.max(15, Math.round((endsAt - startsAt) / 60000));

    requestAnimationFrame(() => {
      const previewEl = document.querySelector(".ec-quick-create-preview");
      if (!(previewEl instanceof HTMLElement)) return;
      const rect = previewEl.getBoundingClientRect();
      if (rect.width <= 0 && rect.height <= 0) return;
      popoverAnchor = {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      };
    });
  }

  function handleCalendarViewRangeChange(start: Date, end: Date) {
    const from = fromCalendarEventDate(start);
    const to = fromCalendarEventDate(end);
    if (calendarQueryRange?.from === from && calendarQueryRange.to === to) return;
    calendarQueryRange = { from, to };
  }

  function handleEventClick(liveClass: LiveClass, anchor: SelectionAnchor) {
    closePopover();
    openEditPopover(liveClass, anchor);
  }

  function openToolbarQuickCreate() {
    closePopover();
    resetCreateForm();
    startsAtLocal = defaultStartsAtLocal();
    durationMinutes = 50;

    const container = document.querySelector(".weekly-agenda-container") as HTMLElement | null;
    const startMs = parseDateTimeLocal(startsAtLocal);
    openCreatePopover(
      anchorFromCalendarSelection(
        container,
        toCalendarEventDate(startMs),
        toCalendarEventDate(startMs + durationMinutes * 60 * 1000),
      ),
    );
  }

  onMount(() => {
    void loadAvailability();
  });
</script>

{#if loading}
  <div class="studio-skeleton">
    <div class="skeleton skeleton--header"></div>
    <div class="skeleton skeleton--grid"></div>
  </div>
{:else if (error || classesQueryError) && classes.length === 0}
  <div class="studio-error">
    <p>{error || classesQueryError}</p>
    <button class="hb-button hb-button--ghost" type="button" onclick={retryLoad}>נסה שוב</button>
  </div>
{:else}
  <div class="studio-page" class:studio-page--availability-mode={availabilityPaintMode}>
    <header class="studio-toolbar" aria-label="כלי סטודיו לייב">
      <ToggleGroup.Root
        type="single"
        value={typeFilter}
        onValueChange={(v) => {
          if (v === "all" || v === "group_live" || v === "one_on_one") typeFilter = v;
        }}
        class="studio-filter"
        aria-label="סינון לפי סוג שיעור"
      >
        <ToggleGroup.Item value="all" class="studio-bar-btn">הכל</ToggleGroup.Item>
        <ToggleGroup.Item value="group_live" class="studio-bar-btn">קבוצתי</ToggleGroup.Item>
        <ToggleGroup.Item value="one_on_one" class="studio-bar-btn">1:1</ToggleGroup.Item>
      </ToggleGroup.Root>

      <div class="studio-toolbar__actions">
        <Toggle.Root
          bind:pressed={availabilityPaintMode}
          onPressedChange={toggleAvailabilityPaintMode}
          aria-label="סימון זמינות 1:1"
        >
          {#snippet child({ props, pressed })}
            <button
              {...props}
              class="studio-bar-btn studio-bar-btn--icon studio-bar-btn--availability"
              data-state={pressed ? "on" : "off"}
            >
              <span class="material-symbols-rounded" aria-hidden="true">edit_calendar</span>
              זמינות 1:1
              {#if availabilitySaving}
                <span class="studio-availability-chip__dot" aria-hidden="true"></span>
              {/if}
            </button>
          {/snippet}
        </Toggle.Root>

        <button
          class="studio-bar-btn studio-bar-btn--icon"
          type="button"
          onclick={() => (showRequestsPanel = true)}
        >
          <span class="material-symbols-rounded" aria-hidden="true">inbox</span>
          בקשות
          {#if pendingRequestCount > 0}
            <span class="studio-badge" aria-label="{pendingRequestCount} בקשות ממתינות">
              {pendingRequestCount}
            </span>
          {/if}
        </button>
      </div>
    </header>

    {#if error}
      <div class="form-error studio-inline-error" role="alert">
        <span class="material-symbols-rounded">error</span>
        {error}
      </div>
    {/if}

    {#if availabilityError}
      <div class="form-error studio-inline-error" role="alert">
        <span class="material-symbols-rounded">error</span>
        {availabilityError}
      </div>
    {/if}

    {#if availabilityPaintMode}
      <section class="studio-availability-mode" aria-live="polite" aria-label="מצב סימון זמינות">
        <div class="studio-availability-mode__mark" aria-hidden="true">
          <span class="material-symbols-rounded">edit_calendar</span>
        </div>
        <div class="studio-availability-mode__copy">
          <strong>מצב סימון זמינות 1:1 פעיל</strong>
          <span>גררי על הלוח כדי לפתוח או להסיר זמינות. שיעורים קבוצתיים מוצגים ברקע בזמן הסימון.</span>
        </div>
        <div class="studio-availability-mode__actions">
          <span class="studio-availability-mode__status">{availabilityModeStatus}</span>
          <button class="studio-bar-btn studio-bar-btn--icon" type="button" onclick={() => toggleAvailabilityPaintMode(false)}>
            <span class="material-symbols-rounded" aria-hidden="true">check</span>
            סיום סימון
          </button>
        </div>
      </section>
    {/if}

    {#await import("$features/live/components/WeeklyAgenda.svelte") then { default: WeeklyAgenda }}
      <WeeklyAgenda
        bind:this={weeklyAgenda}
        classes={studioCalendarClasses}
        {typeFilter}
        onStart={startLive}
        onEnd={endLive}
        {actionId}
        onSelectSlot={handleSelectSlot}
        onEventClick={handleEventClick}
        createPreview={availabilityPaintMode ? null : quickCreatePreview}
        onCreatePreviewChange={handleCreatePreviewChange}
        {availabilityPaintMode}
        availabilityPainted={availabilityPainted}
        onAvailabilityPaintChange={handleAvailabilityPaintChange}
        onViewRangeChange={handleCalendarViewRangeChange}
      />
    {/await}
  </div>
{/if}

<LiveEventPopover
  bind:open={popoverOpen}
  mode={popoverMode}
  anchor={popoverAnchor}
  liveClass={popoverEditClass}
  bind:title
  bind:description
  bind:liveType
  bind:startsAtLocal
  bind:durationMinutes
  bind:joinOpensMinutesBefore
  bind:capacity
  bind:requiredEquipment
  pending={popoverPending}
  onSubmit={() => (popoverMode === "create" ? void createClass() : void submitEdit())}
  onCancel={closePopover}
  onDelete={() => void submitCancellation()}
  onEndLive={() => {
    if (popoverEditClass) void endLive(popoverEditClass._id);
  }}
/>

<LiveClassModalShell
  bind:open={showRequestsPanel}
  title="בקשות ממתינות"
  icon="inbox"
  iconColor="var(--primary)"
  wide
>
  <OneOnOneRequestsPanel bind:this={requestsPanel} onPendingCountChange={(n) => (pendingRequestCount = n)} />
</LiveClassModalShell>

<style>
  .studio-page {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    direction: rtl;
    gap: 0;
  }

  .studio-page--availability-mode {
    background: color-mix(in oklch, var(--primary) 2%, var(--paper));
  }

  .studio-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    flex-shrink: 0;
    border-bottom: 1px solid var(--line-light);
    background: var(--paper);
  }

  :global(.studio-filter) {
    display: inline-flex;
    gap: var(--space-1);
    flex-wrap: wrap;
  }

  :global(.studio-bar-btn) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    min-height: 40px;
    padding: var(--space-1) var(--space-3);
    border: 1px solid var(--line-light);
    background: var(--elevated);
    color: var(--ink);
    font: inherit;
    font-weight: 700;
    font-size: var(--step--1);
    cursor: pointer;
    border-radius: 4px;
    transition:
      background 0.15s ease,
      border-color 0.15s ease,
      color 0.15s ease,
      box-shadow 0.15s ease;
  }

  :global(.studio-bar-btn:hover:not([data-state="on"])) {
    background: var(--surface);
    border-color: var(--line);
  }

  :global(.studio-bar-btn:focus-visible) {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  :global(.studio-bar-btn--icon .material-symbols-rounded) {
    font-size: 1.125rem;
    line-height: 1;
  }

  :global(.studio-bar-btn[data-state="on"][data-value="one_on_one"]) {
    background: var(--primary);
    border-color: var(--primary);
    color: var(--paper);
  }

  :global(.studio-bar-btn[data-state="on"][data-value="one_on_one"]:hover) {
    background: var(--primary);
    border-color: var(--primary);
    color: var(--paper);
    box-shadow: 0 0 0 1px var(--primary);
  }

  :global(.studio-filter .studio-bar-btn:hover:not([data-state="on"])[data-value="one_on_one"]) {
    border-color: var(--primary);
    box-shadow: 0 0 0 1px var(--primary);
  }

  :global(.studio-bar-btn[data-state="on"][data-value="group_live"]) {
    background: color-mix(in oklch, var(--accent) 18%, var(--elevated));
    border-color: var(--accent);
    color: var(--ink);
  }

  :global(.studio-bar-btn[data-state="on"][data-value="group_live"]:hover) {
    box-shadow: 0 0 0 1px var(--accent);
  }

  :global(.studio-bar-btn--availability[data-state="on"]) {
    background: var(--primary);
    border-color: var(--primary);
    color: var(--paper);
    box-shadow:
      0 0 0 1px var(--primary),
      0 10px 24px -18px var(--primary);
  }

  :global(.studio-bar-btn--availability[data-state="on"]:hover) {
    background: var(--primary);
    border-color: var(--primary);
    color: var(--paper);
    box-shadow:
      0 0 0 1px var(--primary),
      0 10px 24px -18px var(--primary);
  }

  .studio-availability-mode {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3);
    border-bottom: 1px solid color-mix(in oklch, var(--primary) 28%, var(--line-light));
    background:
      linear-gradient(
        90deg,
        color-mix(in oklch, var(--primary) 10%, var(--paper)),
        color-mix(in oklch, var(--primary) 4%, var(--paper))
      );
    color: var(--ink);
  }

  .studio-availability-mode__mark {
    display: inline-grid;
    place-items: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 4px;
    background: var(--primary);
    color: var(--paper);
    box-shadow: 0 14px 28px -22px var(--primary);
  }

  .studio-availability-mode__mark .material-symbols-rounded {
    font-size: 1.25rem;
  }

  .studio-availability-mode__copy {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    min-width: 0;
  }

  .studio-availability-mode__copy strong {
    font-size: var(--step-0);
    line-height: 1.25;
  }

  .studio-availability-mode__copy span,
  .studio-availability-mode__status {
    color: var(--foreground-muted);
    font-size: var(--step--1);
    line-height: 1.4;
  }

  .studio-availability-mode__actions {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    white-space: nowrap;
  }

  :global(.studio-filter .studio-bar-btn[data-state="on"][data-value="all"]) {
    background: var(--ink);
    border-color: var(--ink);
    color: var(--paper);
  }

  :global(.studio-filter .studio-bar-btn[data-state="on"][data-value="all"]:hover) {
    box-shadow: 0 0 0 1px var(--ink);
  }

  .studio-availability-chip__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    opacity: 0.85;
    animation: pulse 1s ease-in-out infinite;
  }

  .studio-toolbar__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    align-items: center;
  }

  .studio-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.25rem;
    height: 1.25rem;
    padding: 0 0.35rem;
    border-radius: 999px;
    background: var(--primary);
    color: var(--paper);
    font-family: var(--font-mono);
    font-size: var(--step--2);
    font-weight: 900;
    line-height: 1;
  }

  .studio-skeleton {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-4);
    height: 100%;
  }

  .skeleton {
    background: var(--line-light);
    animation: pulse 1.6s ease-in-out infinite;
    border-radius: 4px;
  }

  .skeleton--header {
    height: 48px;
    width: 60%;
  }

  .skeleton--grid {
    flex: 1;
    min-height: 0;
  }

  .studio-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-6);
    text-align: center;
  }

  .studio-error p {
    color: var(--danger);
    font-weight: 700;
    margin: 0;
  }

  .form-error {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    background: var(--surface);
    color: var(--danger);
    border: 1px solid var(--danger);
    padding: var(--space-3);
    font-weight: 800;
    font-size: var(--step--1);
    margin-block-start: var(--space-3);
  }

  .form-error .material-symbols-rounded {
    font-size: var(--step-1);
    flex-shrink: 0;
  }

  .studio-inline-error {
    margin: 0 var(--space-3);
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.35;
    }
  }

  @media (max-width: 720px) {
    .studio-availability-mode {
      grid-template-columns: auto minmax(0, 1fr);
    }

    .studio-availability-mode__actions {
      grid-column: 1 / -1;
      justify-content: space-between;
      white-space: normal;
    }
  }
</style>
