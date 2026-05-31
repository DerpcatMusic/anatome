<script lang="ts">
  import { DropdownMenu, Toggle } from "bits-ui";

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

  const hasDeviceMenu = $derived(!disabled && devices.length > 1);

  function handleToggle() {
    onToggle();
  }

  function handleSelectDevice(value: string) {
    if (value) onSelectDevice(value);
  }
</script>

<div
  class="lr-media-split"
  class:lr-media-split--on={enabled}
  class:lr-media-split--busy={busy}
  data-kind={kind}
>
  <Toggle.Root
    pressed={enabled}
    onPressedChange={handleToggle}
    disabled={disabled || busy}
    aria-label={toggleLabel}
    title={toggleLabel}
    aria-busy={busy}
  >
    {#snippet child({ props, pressed })}
      <button
        {...props}
        type="button"
        class="lr-dock-btn lr-dock-btn--toggle lr-dock-btn--primary"
        class:lr-dock-btn--on={pressed}
        data-state={pressed ? "on" : "off"}
      >
        <span class="material-symbols-rounded" aria-hidden="true">{icon}</span>
      </button>
    {/snippet}
  </Toggle.Root>

  {#if hasDeviceMenu}
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        {#snippet child({ props })}
          <button
            {...props}
            type="button"
            class="lr-dock-btn lr-dock-btn--menu"
            aria-label={deviceMenuLabel}
          >
            <span class="material-symbols-rounded" aria-hidden="true">expand_more</span>
          </button>
        {/snippet}
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
            onValueChange={handleSelectDevice}
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
