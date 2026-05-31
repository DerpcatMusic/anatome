<script lang="ts">
  import { Select, Switch } from "bits-ui";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import type { LiveSessionPreConnect } from "$lib/features/live/live-session.svelte";
  import type {
    AudioPresetChoice,
    DegradationPreferenceChoice,
  } from "$lib/features/live/types";

  let {
    session,
    mode,
    afterChange,
    selectOverlayClass,
  }: {
    session: LiveSessionPreConnect;
    mode: "prep" | "compact";
    afterChange: (syncResolution?: boolean) => void;
    selectOverlayClass: string;
  } = $props();

  const { t } = useI18n();

  let showAdvanced = $state(true);

  const advancedExpanded = $derived(mode === "compact" || showAdvanced);
  const showAdvancedToggle = $derived(mode !== "compact");

  const audioOptions: { value: AudioPresetChoice; label: string }[] = [
    { value: "speech", label: "דיבור" },
    { value: "music", label: "תנועה" },
    { value: "musicStereo", label: "סטריאו" },
    { value: "musicHighQuality", label: "Hi-Fi" },
    { value: "musicHighQualityStereo", label: "Hi-Fi סטריאו" },
  ];

  const priorityOptions: { value: DegradationPreferenceChoice; label: string }[] = [
    { value: "maintain-framerate", label: "תנועה חלקה" },
    { value: "maintain-resolution", label: "תמונה חדה" },
    { value: "balanced", label: "מאוזן" },
  ];

  function toggleAdvanced() {
    showAdvanced = !showAdvanced;
  }

  function handleAudioPresetChange(selected: string) {
    session.selectedAudioPreset = selected as AudioPresetChoice;
    afterChange();
  }

  function handlePriorityChange(selected: string) {
    session.degradationPreference = selected as DegradationPreferenceChoice;
    afterChange();
  }

  function handleSimulcastChange() {
    afterChange();
  }

  function handleStereoChange() {
    afterChange();
  }
</script>

{#snippet selectOptionItem(option: { value: string; label: string })}
  <Select.Item class="hb-select__item" value={option.value} label={option.label}>
    {#snippet children({ selected })}
      <span>{option.label}</span>
      {#if selected}
        <span class="hb-select__check" aria-hidden="true"></span>
      {/if}
    {/snippet}
  </Select.Item>
{/snippet}

{#if session.isInstructorRoom}
  {#if showAdvancedToggle}
    <button type="button" class="advanced-toggle" onclick={toggleAdvanced}>
      <span class="material-symbols-rounded" aria-hidden="true"
        >{showAdvanced ? "expand_less" : "expand_more"}</span
      >
      <span>{t.live.preConnect.advancedSettingsLabel()}</span>
    </button>
  {/if}

  {#if advancedExpanded}
    <div class="publish-stack publish-stack--advanced" class:publish-stack--advanced-flat={mode === "compact"}>
      <div class="hb-field hb-field--stacked">
        <span class="hb-field__label">{t.live.preConnect.audioLabel()}</span>
        <Select.Root
          type="single"
          value={String(session.selectedAudioPreset)}
          onValueChange={handleAudioPresetChange}
        >
          <Select.Trigger class="hb-select__trigger" aria-label={t.live.preConnect.audioLabel()}>
            <span class="hb-select__value"
              >{audioOptions.find((o) => o.value === session.selectedAudioPreset)?.label ?? ""}</span
            >
            <span class="hb-select__chevron" aria-hidden="true"></span>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content class={selectOverlayClass} sideOffset={6}>
              <Select.Viewport class="hb-select__viewport">
                {#each audioOptions as option (option.value)}
                  {@render selectOptionItem(option)}
                {/each}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>

      <div class="hb-field hb-field--stacked">
        <span class="hb-field__label">{t.live.preConnect.priorityLabel()}</span>
        <Select.Root
          type="single"
          value={String(session.degradationPreference)}
          onValueChange={handlePriorityChange}
        >
          <Select.Trigger class="hb-select__trigger" aria-label={t.live.preConnect.priorityLabel()}>
            <span class="hb-select__value"
              >{priorityOptions.find((o) => o.value === session.degradationPreference)?.label ?? ""}</span
            >
            <span class="hb-select__chevron" aria-hidden="true"></span>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content class={selectOverlayClass} sideOffset={6}>
              <Select.Viewport class="hb-select__viewport">
                {#each priorityOptions as option (option.value)}
                  {@render selectOptionItem(option)}
                {/each}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>

      <div class="publish-fields__toggles">
        <span class="hb-switch">
          <Switch.Root
            class="hb-switch__root"
            aria-label={t.live.preConnect.simulcastLabel()}
            bind:checked={session.simulcastEnabled}
            onCheckedChange={handleSimulcastChange}
          >
            <Switch.Thumb class="hb-switch__thumb" />
          </Switch.Root>
          <span>{t.live.preConnect.simulcastLabel()}</span>
        </span>
        <span class="hb-switch">
          <Switch.Root
            class="hb-switch__root"
            aria-label={t.live.preConnect.stereoLabel()}
            bind:checked={session.forceStereo}
            onCheckedChange={handleStereoChange}
          >
            <Switch.Thumb class="hb-switch__thumb" />
          </Switch.Root>
          <span>{t.live.preConnect.stereoLabel()}</span>
        </span>
      </div>
    </div>
  {/if}
{/if}

<style>
  .publish-stack {
    display: grid;
    gap: var(--space-3);
    width: 100%;
  }

  .publish-stack--advanced {
    padding-top: var(--space-2);
    border-top: 1px solid var(--border-color);
  }

  .publish-stack--advanced-flat {
    padding-top: 0;
    border-top: none;
  }

  .advanced-toggle {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--accent);
    font: inherit;
    font-size: var(--step--1);
    font-weight: 700;
    cursor: pointer;
  }

  .publish-fields__toggles {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2) var(--space-4);
  }
</style>
