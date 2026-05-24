<script lang="ts">
  import { onMount, untrack } from "svelte";
  import { api } from "$convex/_generated/api";
  import type { FunctionReturnType } from "convex/server";
  import type { Id } from "$convex/_generated/dataModel";
  import { authQuery, setCachedRole } from "$lib/auth/session.svelte";
  import { useConvexClient } from "convex-svelte";
  import { liveRoomHref } from "$lib/i18n/context";
  import { Button, Toggle, ToggleGroup } from "bits-ui";
  import WeeklyAgenda from "$features/live/components/WeeklyAgenda.svelte";
  import LiveClassModalShell from "$features/live/components/LiveClassModalShell.svelte";
  import LiveEventPopover from "$features/live/components/LiveEventPopover.svelte";
  import OneOnOneRequestsPanel from "./OneOnOneRequestsPanel.svelte";
  import {
    createEmptyPainted,
    hasAnyPaintedSlots,
    paintedEquals,
    rulesToPainted,
    type AvailabilityRule,
    type PaintedSlots,
  } from "$features/studio/lib/one-on-one-availability";
  import { saveAvailabilityFromPainted } from "$features/studio/lib/save-availability-rules";
  import type { Equipment } from "$lib/labels";
  import type { SelectionAnchor } from "$features/live/types/selection-anchor";
  import { anchorFromCalendarSelection } from "$features/live/types/selection-anchor";
  import { parseDateTimeLocal, toDateTimeLocalString } from "$lib/datetime/local";

  type LiveClass = FunctionReturnType<typeof api.live.class.listMine>[number];
  type ViewerProfile = FunctionReturnType<typeof api.profiles.viewer.get>;
  type ClassTypeFilter = "all" | "group_live" | "one_on_one";

  let profile = $state<ViewerProfile | null>(null);
  let classes = $state<LiveClass[]>([]);
  let loading = $state(true);
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
  let availabilitySlotMinutes = $state(50);
  let availabilityBufferMinutes = $state(10);
  let availabilityActionId = $state<string | null>(null);
  let availabilityError = $state("");
  let availabilityPublishResult = $state<{ created: number; skipped: number } | null>(null);

  let title = $state("פילאטיס לייב - נשימה, כוח ותנועה");
  let description = $state("שיעור דו־כיווני קטן עם תיקונים אישיים. הכיני מרחב שקט, מצלמה פתוחה וציוד מתאים.");
  let liveType = $state<"group_live" | "one_on_one">("group_live");
  let startsAtLocal = $state(defaultStartsAtLocal());
  let durationMinutes = $state(50);
  let joinOpensMinutesBefore = $state(15);
  let capacity = $state(12);
  let requiredEquipment = $state<Equipment[]>(["mat"]);

  let requestsPanel = $state<{ refresh: () => Promise<void> } | undefined>(undefined);
  let weeklyAgenda = $state<{ clearCalendarSelection: () => void } | undefined>();

  const client = useConvexClient();

  const filteredClasses = $derived(
    typeFilter === "all" ? classes : classes.filter((c) => c.type === typeFilter),
  );

  const quickCreatePreview = $derived(
    popoverOpen && popoverMode === "create" && startsAtLocal
      ? {
          startsAt: parseDateTimeLocal(startsAtLocal),
          endsAt: parseDateTimeLocal(startsAtLocal) + durationMinutes * 60 * 1000,
        }
      : null,
  );

  const popoverPending = $derived(
    actionId === "create" || actionId === "edit" || actionId === "cancel",
  );

  const availabilityDirty = $derived(
    !paintedEquals(availabilityPainted, availabilitySavedPainted),
  );

  const activeAvailabilityRuleCount = $derived(
    availabilityRules.filter((r) => r.isActive).length,
  );

  function defaultStartsAtLocal() {
    const date = new Date(Date.now() + 60 * 60 * 1000);
    date.setMinutes(0, 0, 0);
    return toDateTimeLocalString(date);
  }

  function resetCreateForm() {
    title = "פילאטיס לייב - נשימה, כוח ותנועה";
    description =
      "שיעור דו־כיווני קטן עם תיקונים אישיים. הכיני מרחב שקט, מצלמה פתוחה וציוד מתאים.";
    liveType = "group_live";
    capacity = 12;
    joinOpensMinutesBefore = 15;
    requiredEquipment = ["mat"];
  }

  function populateFormFromClass(liveClass: LiveClass) {
    title = liveClass.title;
    description = liveClass.description ?? "";
    liveType = liveClass.type;
    startsAtLocal = toDateTimeLocalString(new Date(liveClass.startsAt));
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
      if (loaded.length > 0) {
        availabilitySlotMinutes = loaded[0].slotMinutes;
        availabilityBufferMinutes = loaded[0].bufferMinutes;
      }
      const painted = rulesToPainted(loaded);
      availabilityPainted = painted;
      availabilitySavedPainted = painted;
    } catch (reason) {
      availabilityError =
        reason instanceof Error ? reason.message : "לא הצלחנו לטעון זמינות 1:1.";
    }
  }

  async function load() {
    loading = true;
    error = "";
    try {
      profile = await authQuery(api.profiles.viewer.get, {});
      if (profile === null || (profile.role !== "admin" && profile.role !== "instructor")) {
        window.location.assign("/calendar");
        return;
      }
      setCachedRole(profile.role);
      classes = (await authQuery(api.live.class.listMine, {})) ?? [];
      const panel = untrack(() => requestsPanel);
      await Promise.all([panel?.refresh(), loadAvailability()]);
    } catch (reason) {
      error = reason instanceof Error ? reason.message : "לא הצלחנו לטעון את אזור הלייב.";
    } finally {
      loading = false;
    }
  }

  async function saveAvailability() {
    availabilityActionId = "save";
    availabilityError = "";
    try {
      await saveAvailabilityFromPainted(
        client,
        availabilityPainted,
        availabilityRules,
        availabilitySlotMinutes,
        availabilityBufferMinutes,
      );
      await loadAvailability();
    } catch (reason) {
      availabilityError =
        reason instanceof Error ? reason.message : "לא הצלחנו לשמור זמינות.";
    } finally {
      availabilityActionId = null;
    }
  }

  async function publishAvailability() {
    availabilityActionId = "publish";
    availabilityError = "";
    availabilityPublishResult = null;
    try {
      if (availabilityDirty) await saveAvailability();
      availabilityPublishResult = await client.mutation(
        api.oneOnOne.instructor.publishAvailability,
        { weeksAhead: 4 },
      );
      await load();
    } catch (reason) {
      availabilityError =
        reason instanceof Error ? reason.message : "לא הצלחנו לפרסם חלונות.";
    } finally {
      availabilityActionId = null;
    }
  }

  function handleAvailabilityPaintChange(next: PaintedSlots) {
    availabilityPainted = next;
  }

  function toggleAvailabilityPaintMode(pressed: boolean) {
    availabilityPaintMode = pressed;
    weeklyAgenda?.clearCalendarSelection();
    if (availabilityPaintMode) closePopover();
  }

  async function retryLoad() {
    await load();
  }

  async function createClass() {
    error = "";
    actionId = "create";
    try {
      await client.mutation(api.live.class.create, {
        title,
        description,
        type: liveType,
        startsAt: parseDateTimeLocal(startsAtLocal),
        durationMinutes,
        joinOpensMinutesBefore,
        capacity: liveType === "one_on_one" ? 1 : capacity,
        requiredEquipment: requiredEquipment.length > 0 ? requiredEquipment : ["mat"],
      });
      startsAtLocal = defaultStartsAtLocal();
      durationMinutes = 50;
      closePopover();
      resetCreateForm();
      await load();
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
        durationMinutes,
        joinOpensMinutesBefore,
        capacity: liveType === "one_on_one" ? 1 : capacity,
        requiredEquipment: requiredEquipment.length > 0 ? requiredEquipment : ["mat"],
        title: title.trim(),
        description: description.trim(),
      });
      closePopover();
      await load();
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
      await load();
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
      await load();
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
      await load();
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
        new Date(startMs),
        new Date(startMs + slotDurationMinutes * 60 * 1000),
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
    startsAtLocal = toDateTimeLocalString(new Date(startsAt));
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
        new Date(startMs),
        new Date(startMs + durationMinutes * 60 * 1000),
      ),
    );
  }

  onMount(() => {
    void load();
  });
</script>

{#if loading}
  <div class="studio-skeleton">
    <div class="skeleton skeleton--header"></div>
    <div class="skeleton skeleton--grid"></div>
  </div>
{:else if error && classes.length === 0}
  <div class="studio-error">
    <p>{error}</p>
    <button class="hb-button hb-button--ghost" type="button" onclick={retryLoad}>נסה שוב</button>
  </div>
{:else}
  <div class="studio-page">
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
        <ToggleGroup.Item value="all" class="studio-filter__item">הכל</ToggleGroup.Item>
        <ToggleGroup.Item value="group_live" class="studio-filter__item">קבוצתי</ToggleGroup.Item>
        <ToggleGroup.Item value="one_on_one" class="studio-filter__item">1:1</ToggleGroup.Item>
      </ToggleGroup.Root>

      <div class="studio-toolbar__actions">
        <Toggle.Root
          bind:pressed={availabilityPaintMode}
          onPressedChange={toggleAvailabilityPaintMode}
          aria-label="מצב ציור זמינות 1:1"
        >
          {#snippet child({ props, pressed })}
            <button {...props} class="studio-availability-toggle" data-pressed={pressed ? "" : undefined}>
              <span
                class="studio-availability-toggle__inner"
                class:studio-availability-toggle__inner--on={pressed}
              >
                <span class="material-symbols-rounded" aria-hidden="true">brush</span>
                זמינות 1:1
              </span>
            </button>
          {/snippet}
        </Toggle.Root>

        {#if availabilityPaintMode}
          <label class="studio-availability-field">
            <span>משך (דק׳)</span>
            <input
              type="number"
              min="20"
              max="120"
              bind:value={availabilitySlotMinutes}
              disabled={availabilityActionId !== null}
            />
          </label>
          <label class="studio-availability-field">
            <span>מרווח</span>
            <input
              type="number"
              min="0"
              max="60"
              bind:value={availabilityBufferMinutes}
              disabled={availabilityActionId !== null}
            />
          </label>
          <Button.Root
            class="hb-button hb-button--paper studio-toolbar__btn"
            type="button"
            disabled={availabilityActionId !== null || !availabilityDirty}
            onclick={() => void saveAvailability()}
          >
            {availabilityActionId === "save" ? "שומרות..." : "שמירה"}
          </Button.Root>
          <Button.Root
            class="hb-button hb-button--violet studio-toolbar__btn"
            type="button"
            disabled={
              availabilityActionId === "publish" ||
              (!hasAnyPaintedSlots(availabilityPainted) && activeAvailabilityRuleCount === 0)
            }
            onclick={() => void publishAvailability()}
          >
            {availabilityActionId === "publish" ? "מפרסמת..." : "פרסום חלונות"}
          </Button.Root>
        {/if}

        <Button.Root
          class="hb-button hb-button--paper studio-toolbar__btn"
          type="button"
          onclick={() => (showRequestsPanel = true)}
        >
          <span class="material-symbols-rounded" aria-hidden="true">inbox</span>
          בקשות 1:1
          {#if pendingRequestCount > 0}
            <span class="studio-badge" aria-label="{pendingRequestCount} בקשות ממתינות">
              {pendingRequestCount}
            </span>
          {/if}
        </Button.Root>
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

    {#if availabilityPublishResult}
      <p class="studio-publish-result" role="status">
        נוצרו {availabilityPublishResult.created} חלונות · דולגו {availabilityPublishResult.skipped}
      </p>
    {/if}

    {#if availabilityPaintMode}
      <p class="studio-availability-hint">
        גררי על הלוח כדי לצייר שעות פנויות חוזרות (לפי יום בשבוע). לחיצה על אזור צבוע מסירה אותו.
      </p>
    {/if}

    <WeeklyAgenda
      bind:this={weeklyAgenda}
      classes={filteredClasses}
      onStart={startLive}
      onEnd={endLive}
      {actionId}
      onSelectSlot={handleSelectSlot}
      onRefreshClasses={load}
      onCreateButtonClick={openToolbarQuickCreate}
      onEventClick={handleEventClick}
      createPreview={availabilityPaintMode ? null : quickCreatePreview}
      onCreatePreviewChange={handleCreatePreviewChange}
      {availabilityPaintMode}
      availabilityPainted={availabilityPainted}
      onAvailabilityPaintChange={handleAvailabilityPaintChange}
    />
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
  title="בקשות 1:1 ממתינות"
  icon="inbox"
  iconColor="var(--violet-strong)"
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
    gap: var(--space-2);
  }

  .studio-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3) 0;
    flex-shrink: 0;
    position: relative;
    z-index: 5;
  }

  :global(.studio-filter) {
    display: inline-flex;
    gap: var(--space-1);
    flex-wrap: wrap;
  }

  :global(.studio-filter__item) {
    min-height: 40px;
    padding: var(--space-1) var(--space-3);
    border: var(--border);
    background: var(--white);
    font: inherit;
    font-weight: 800;
    font-size: var(--step--1);
    cursor: pointer;
    border-radius: 4px;
    transition: background 0.15s ease, border-color 0.15s ease;
  }

  :global(.studio-filter__item[data-state="on"]) {
    background: var(--ink);
    color: var(--paper);
    border-color: var(--ink);
  }

  :global(.studio-filter__item[data-state="on"][data-value="one_on_one"]) {
    background: var(--violet-strong);
    border-color: var(--violet-strong);
    color: var(--paper);
  }

  .studio-toolbar__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    align-items: center;
  }

  :global(.studio-toolbar__btn) {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    position: relative;
  }

  :global(.studio-availability-toggle) {
    border: none;
    padding: 0;
    background: transparent;
    cursor: pointer;
    font: inherit;
    position: relative;
    z-index: 2;
  }

  :global(.studio-availability-toggle__inner) {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    min-height: 40px;
    padding: var(--space-1) var(--space-3);
    border: var(--border);
    background: var(--white);
    font-weight: 800;
    font-size: var(--step--1);
    border-radius: 4px;
    transition:
      background 0.15s ease,
      border-color 0.15s ease,
      color 0.15s ease;
  }

  :global(.studio-availability-toggle__inner--on) {
    background: var(--violet-strong);
    border-color: var(--violet-strong);
    color: var(--paper);
  }

  .studio-availability-field {
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: var(--step--2);
    font-weight: 700;
    color: var(--muted);
  }

  .studio-availability-field input {
    width: 4.25rem;
    min-height: 36px;
    padding: var(--space-1) var(--space-2);
    font-family: var(--font-mono);
    font-weight: 800;
    font-size: var(--step--2);
  }

  .studio-availability-hint {
    margin: 0 var(--space-3);
    font-size: var(--step--2);
    font-weight: 700;
    color: var(--muted);
    font-family: var(--font-mono);
  }

  .studio-publish-result {
    margin: 0 var(--space-3);
    font-size: var(--step--1);
    font-weight: 700;
    color: var(--success-text);
  }

  .studio-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.25rem;
    height: 1.25rem;
    padding: 0 0.35rem;
    border-radius: 999px;
    background: var(--violet-strong);
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
    color: var(--danger-text);
    font-weight: 700;
    margin: 0;
  }

  .form-error {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    background: var(--danger-soft);
    color: var(--danger-text);
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
</style>
