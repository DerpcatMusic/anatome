<script lang="ts">
	import { Toggle, ToggleGroup } from "bits-ui";

	type ClassTypeFilter = "all" | "group_live" | "one_on_one";

	let {
		typeFilter,
		onTypeFilterChange,
		availabilityPaintMode,
		onToggleAvailabilityPaintMode,
		availabilitySaving,
		availabilityModeStatus,
		pendingRequestCount,
		onOpenRequestsPanel,
		onEndAvailabilityPaintMode,
		error,
		availabilityError,
	}: {
		typeFilter: ClassTypeFilter;
		onTypeFilterChange: (v: string) => void;
		availabilityPaintMode: boolean;
		onToggleAvailabilityPaintMode: (pressed: boolean) => void;
		availabilitySaving: boolean;
		availabilityModeStatus: string;
		pendingRequestCount: number;
		onOpenRequestsPanel: () => void;
		onEndAvailabilityPaintMode: () => void;
		error: string;
		availabilityError: string;
	} = $props();
</script>

<header class="studio-toolbar" aria-label="כלי סטודיו לייב">
	<ToggleGroup.Root
		type="single"
		value={typeFilter}
		onValueChange={onTypeFilterChange}
		class="studio-filter"
		aria-label="סינון לפי סוג שיעור"
	>
		<ToggleGroup.Item value="all" class="studio-bar-btn">הכל</ToggleGroup.Item>
		<ToggleGroup.Item value="group_live" class="studio-bar-btn">קבוצתי</ToggleGroup.Item>
		<ToggleGroup.Item value="one_on_one" class="studio-bar-btn">1:1</ToggleGroup.Item>
	</ToggleGroup.Root>

	<div class="studio-toolbar__actions">
		<Toggle.Root
			pressed={availabilityPaintMode}
			onPressedChange={onToggleAvailabilityPaintMode}
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
			onclick={onOpenRequestsPanel}
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
			<button
				class="studio-bar-btn studio-bar-btn--icon"
				type="button"
				onclick={onEndAvailabilityPaintMode}
			>
				<span class="material-symbols-rounded" aria-hidden="true">check</span>
				סיום סימון
			</button>
		</div>
	</section>
{/if}
