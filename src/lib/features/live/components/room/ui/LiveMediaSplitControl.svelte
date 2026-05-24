<script lang="ts">
  import { DropdownMenu, Toggle, Tooltip } from "bits-ui";

  export type MediaDeviceOption = {
    deviceId: string;
    label: string;
  };

  let {
    kind,
    enabled,
    busy = false,
    disabled = false,
    devices = [],
    selectedDeviceId = "",
    toggleLabel,
    tooltipLabel,
    deviceMenuLabel,
    onToggle,
    onSelectDevice,
  }: {
    kind: "mic" | "camera";
    enabled: boolean;
    busy?: boolean;
    disabled?: boolean;
    devices?: MediaDeviceOption[];
    selectedDeviceId?: string;
    toggleLabel: string;
    tooltipLabel: string;
    deviceMenuLabel: string;
    onToggle: () => void;
    onSelectDevice: (deviceId: string) => void;
  } = $props();

  const icon = $derived(
    kind === "mic"
      ? enabled
        ? "mic"
        : "mic_off"
      : enabled
        ? "videocam"
        : "videocam_off",
  );

  const hasDeviceMenu = $derived(devices.length > 1);
</script>

<div
  class="hb-media-split lr-media-split"
  class:hb-media-split--on={enabled}
  class:hb-media-split--busy={busy}
  data-kind={kind}
>
  <Tooltip.Root>
    <Tooltip.Trigger class="hb-tooltip-trigger hb-media-split__main-wrap">
      <Toggle.Root
        pressed={enabled}
        onPressedChange={() => onToggle()}
        disabled={disabled || busy}
        aria-label={toggleLabel}
        aria-busy={busy}
      >
        {#snippet child({ props, pressed })}
          <button
            {...props}
            type="button"
            class="hb-media-split__main"
            data-state={pressed ? "on" : "off"}
          >
            <span class="material-symbols-rounded" aria-hidden="true">{icon}</span>
          </button>
        {/snippet}
      </Toggle.Root>
    </Tooltip.Trigger>
    <Tooltip.Portal>
      <Tooltip.Content class="hb-tooltip-content">{tooltipLabel}</Tooltip.Content>
    </Tooltip.Portal>
  </Tooltip.Root>

  {#if hasDeviceMenu}
    <span class="hb-media-split__divider" aria-hidden="true"></span>
    <DropdownMenu.Root>
      <DropdownMenu.Trigger class="hb-dropdown-trigger">
        <button type="button" class="hb-media-split__menu" aria-label={deviceMenuLabel}>
          <span class="material-symbols-rounded" aria-hidden="true">expand_more</span>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          class="hb-dropdown-content lr-device-dropdown"
          side="top"
          align="center"
          sideOffset={8}
        >
          <DropdownMenu.RadioGroup
            value={selectedDeviceId}
            onValueChange={(value) => {
              if (value) onSelectDevice(value);
            }}
          >
            {#each devices as device (device.deviceId)}
              <DropdownMenu.RadioItem
                class="hb-dropdown-item"
                value={device.deviceId}
                textValue={device.label}
              >
                {device.label}
              </DropdownMenu.RadioItem>
            {/each}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  {/if}
</div>

<style>
  .hb-media-split__main-wrap {
    display: contents;
  }
</style>
