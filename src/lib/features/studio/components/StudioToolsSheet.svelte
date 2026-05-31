<script lang="ts">
  import { Toggle, ToggleGroup } from "bits-ui";
  import HbBottomSheet from "$lib/components/ui/HbBottomSheet.svelte";

  type ClassTypeFilter = "all" | "group_live" | "one_on_one";

  let {
    open = $bindable(false),
    typeFilter = $bindable(),
    availabilityPaintMode = $bindable(),
    availabilitySaving = false,
    availabilityDirty = false,
    availabilityModeStatus = "",
    pendingRequestCount = 0,
    onOpenRequests,
    onToggleAvailability,
  }: {
    open?: boolean;
    typeFilter: ClassTypeFilter;
    availabilityPaintMode: boolean;
    availabilitySaving?: boolean;
    availabilityDirty?: boolean;
    availabilityModeStatus?: string;
    pendingRequestCount?: number;
    onOpenRequests: () => void;
    onToggleAvailability: (next: boolean) => void;
  } = $props();

  const filterLabel = $derived(
    typeFilter === "group_live" ? "קבוצתי" : typeFilter === "one_on_one" ? "1:1" : "הכל",
  );

  function openRequests() {
    open = false;
    onOpenRequests();
  }

  function handleValueChange(v: string) {
    if (v === "all" || v === "group_live" || v === "one_on_one") typeFilter = v;
  }
</script>

<HbBottomSheet bind:open title="כלים ללוח" ariaLabel="כלים ללוח שידור" initialSnap="half">
  <div class="studio-tools-sheet">
    <section class="studio-tools-sheet__section" aria-labelledby="studio-tools-filter-heading">
      <h3 id="studio-tools-filter-heading" class="studio-tools-sheet__heading">סינון שיעורים</h3>
      <p class="studio-tools-sheet__hint">מוצג כרגע: <strong>{filterLabel}</strong></p>
      <ToggleGroup.Root
        type="single"
        value={typeFilter}
        onValueChange={handleValueChange}
        class="studio-filter"
        aria-label="סינון לפי סוג שיעור"
      >
        <ToggleGroup.Item value="all" class="studio-bar-btn">הכל</ToggleGroup.Item>
        <ToggleGroup.Item value="group_live" class="studio-bar-btn">קבוצתי</ToggleGroup.Item>
        <ToggleGroup.Item value="one_on_one" class="studio-bar-btn">1:1</ToggleGroup.Item>
      </ToggleGroup.Root>
    </section>

    <section class="studio-tools-sheet__section" aria-labelledby="studio-tools-availability-heading">
      <h3 id="studio-tools-availability-heading" class="studio-tools-sheet__heading">זמינות 1:1</h3>
      <p class="studio-tools-sheet__hint">
        גררי על הלוח כדי לפתוח או להסיר חלונות זמינות. שיעורים קבוצתיים נשארים ברקע בזמן הסימון.
      </p>
      <Toggle.Root
        pressed={availabilityPaintMode}
        onPressedChange={onToggleAvailability}
        aria-label="סימון זמינות 1:1"
      >
        {#snippet child({ props, pressed })}
          <button
            {...props}
            type="button"
            class="studio-bar-btn studio-bar-btn--icon studio-bar-btn--availability studio-tools-sheet__wide-btn"
            data-state={pressed ? "on" : "off"}
          >
            <span class="material-symbols-rounded" aria-hidden="true">edit_calendar</span>
            {pressed ? "סיום סימון זמינות" : "הפעלת סימון זמינות"}
            {#if availabilitySaving}
              <span class="studio-availability-chip__dot" aria-hidden="true"></span>
            {/if}
          </button>
        {/snippet}
      </Toggle.Root>
      {#if availabilityPaintMode}
        <p class="studio-tools-sheet__status" aria-live="polite">
          {availabilityModeStatus}
          {#if availabilityDirty && !availabilitySaving}
            <span class="studio-tools-sheet__status-muted"> · יש שינויים שלא נשמרו</span>
          {/if}
        </p>
      {/if}
    </section>

    <section class="studio-tools-sheet__section" aria-labelledby="studio-tools-requests-heading">
      <h3 id="studio-tools-requests-heading" class="studio-tools-sheet__heading">בקשות 1:1</h3>
      <button
        type="button"
        class="studio-bar-btn studio-bar-btn--icon studio-tools-sheet__wide-btn"
        onclick={openRequests}
      >
        <span class="material-symbols-rounded" aria-hidden="true">inbox</span>
        בקשות ממתינות
        {#if pendingRequestCount > 0}
          <span class="studio-badge" aria-label="{pendingRequestCount} בקשות ממתינות">
            {pendingRequestCount}
          </span>
        {/if}
      </button>
    </section>
  </div>
</HbBottomSheet>

<style>
  .studio-tools-sheet {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
    direction: rtl;
  }

  .studio-tools-sheet__section {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .studio-tools-sheet__heading {
    margin: 0;
    font-size: var(--step--1);
    font-weight: 800;
    color: var(--ink);
  }

  .studio-tools-sheet__hint {
    margin: 0;
    font-size: var(--step--1);
    line-height: 1.45;
    color: var(--foreground-muted);
  }

  .studio-tools-sheet__hint strong {
    color: var(--ink);
    font-weight: 800;
  }

  .studio-tools-sheet__status {
    margin: 0;
    font-size: var(--step--1);
    font-weight: 700;
    color: var(--primary);
  }

  .studio-tools-sheet__status-muted {
    font-weight: 600;
    color: var(--foreground-muted);
  }

  .studio-tools-sheet :global(.studio-filter) {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1);
  }

  .studio-tools-sheet__wide-btn {
    width: 100%;
    justify-content: flex-start;
  }
</style>
