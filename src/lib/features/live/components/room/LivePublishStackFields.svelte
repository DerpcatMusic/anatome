<script lang="ts">
  import { Select } from "bits-ui";
  import { useI18n } from "$lib/i18n/runes.svelte";
  import type { LiveSessionPreConnect } from "$lib/features/live/live-session.svelte";
  import type {
    BitrateChoice,
    VideoCodecChoice,
    VideoFramerateChoice,
    VideoResolutionChoice,
  } from "$lib/features/live/types";

  let {
    session,
    afterChange,
    selectOverlayClass,
  }: {
    session: LiveSessionPreConnect;
    afterChange: (syncResolution?: boolean) => void;
    selectOverlayClass: string;
  } = $props();

  const { t } = useI18n();
  const isInstructor = $derived(session.isInstructorRoom);

  const instructorResolutionOptions: { value: VideoResolutionChoice; label: string }[] = [
    { value: "1080p", label: "1080p (1920×1080)" },
    { value: "720p", label: "720p (1280×720)" },
    { value: "480p", label: "480p (854×480)" },
    { value: "360p", label: "360p (640×360)" },
  ];
  const customerResolutionOptions: { value: VideoResolutionChoice; label: string }[] = [
    { value: "720p", label: "720p" },
    { value: "360p", label: "360p" },
  ];
  const resolutionOptions = $derived(
    isInstructor ? instructorResolutionOptions : customerResolutionOptions,
  );

  const codecOptions: { value: VideoCodecChoice; label: string; hint?: string }[] = [
    { value: "h264", label: "H.264 (AVC)", hint: "הכי תואם לדפדפנים" },
    { value: "vp8", label: "VP8" },
    { value: "vp9", label: "VP9" },
    { value: "av1", label: "AV1" },
  ];

  const bitrateOptions: { value: BitrateChoice; label: string }[] = [
    { value: 2.5, label: "2.5 Mbps" },
    { value: 4.5, label: "4.5 Mbps" },
    { value: 6, label: "6 Mbps" },
    { value: 8, label: "8 Mbps" },
  ];

  const framerateOptions: { value: VideoFramerateChoice; label: string }[] = [
    { value: 24, label: "24 fps" },
    { value: 30, label: "30 fps" },
    { value: 60, label: "60 fps" },
  ];

  function handleResolutionChange(selected: string) {
    session.selectedResolution = selected as VideoResolutionChoice;
    afterChange(true);
  }

  function handleSubscriberReceiveChange(selected: string) {
    void session.setSubscriberReceivePreset(
      selected as import("$lib/features/live/types").SubscriberReceivePreset,
    );
  }

  function handleCodecChange(selected: string) {
    session.selectedCodec = selected as VideoCodecChoice;
    afterChange();
  }

  function handleBitrateChange(selected: string) {
    session.selectedBitrateMbps = Number(selected) as BitrateChoice;
    afterChange();
  }

  function handleFramerateChange(selected: string) {
    session.selectedFramerate = Number(selected) as VideoFramerateChoice;
    afterChange();
  }
</script>

<div class="publish-stack">
  <div class="hb-field hb-field--stacked">
    <span class="hb-field__label">{t.live.preConnect.resolutionLabel()}</span>
    <Select.Root
      type="single"
      value={String(session.selectedResolution)}
      onValueChange={handleResolutionChange}
    >
      <Select.Trigger class="hb-select__trigger" aria-label={t.live.preConnect.resolutionLabel()}>
        <span class="hb-select__value"
          >{resolutionOptions.find((o) => o.value === session.selectedResolution)?.label ?? ""}</span
        >
        <span class="hb-select__chevron" aria-hidden="true"></span>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content class={selectOverlayClass} sideOffset={6}>
          <Select.Viewport class="hb-select__viewport">
            {#each resolutionOptions as option (option.value)}
              <Select.Item class="hb-select__item" value={option.value} label={option.label}>
                {#snippet children({ selected })}
                  <span>{option.label}</span>
                  {#if selected}
                    <span class="hb-select__check" aria-hidden="true"></span>
                  {/if}
                {/snippet}
              </Select.Item>
            {/each}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  </div>

  {#if isInstructor}
    <div class="hb-field hb-field--stacked">
      <span class="hb-field__label">{t.live.preConnect.subscriberReceiveTitle()}</span>
      <p class="publish-fields__codec-note">{t.live.preConnect.subscriberReceiveHint()}</p>
      <Select.Root
        type="single"
        value={session.subscriberReceivePreset}
        onValueChange={handleSubscriberReceiveChange}
      >
        <Select.Trigger
          class="hb-select__trigger"
          aria-label={t.live.preConnect.subscriberReceiveTitle()}
        >
          <span class="hb-select__value">
            {#if session.subscriberReceivePreset === "low"}
              {t.live.preConnect.subscriberReceiveLow()} — {t.live.preConnect.subscriberReceiveLowDesc()}
            {:else if session.subscriberReceivePreset === "high"}
              {t.live.preConnect.subscriberReceiveHigh()} — {t.live.preConnect.subscriberReceiveHighDesc()}
            {:else}
              {t.live.preConnect.subscriberReceiveMedium()} — {t.live.preConnect.subscriberReceiveMediumDesc()}
            {/if}
          </span>
          <span class="hb-select__chevron" aria-hidden="true"></span>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content class={selectOverlayClass} sideOffset={6}>
            <Select.Viewport class="hb-select__viewport">
              <Select.Item class="hb-select__item" value="low" label={t.live.preConnect.subscriberReceiveLow()}>
                {#snippet children({ selected })}
                  <span>{t.live.preConnect.subscriberReceiveLow()} — {t.live.preConnect.subscriberReceiveLowDesc()}</span>
                  {#if selected}<span class="hb-select__check" aria-hidden="true"></span>{/if}
                {/snippet}
              </Select.Item>
              <Select.Item class="hb-select__item" value="medium" label={t.live.preConnect.subscriberReceiveMedium()}>
                {#snippet children({ selected })}
                  <span>{t.live.preConnect.subscriberReceiveMedium()} — {t.live.preConnect.subscriberReceiveMediumDesc()}</span>
                  {#if selected}<span class="hb-select__check" aria-hidden="true"></span>{/if}
                {/snippet}
              </Select.Item>
              <Select.Item class="hb-select__item" value="high" label={t.live.preConnect.subscriberReceiveHigh()}>
                {#snippet children({ selected })}
                  <span>{t.live.preConnect.subscriberReceiveHigh()} — {t.live.preConnect.subscriberReceiveHighDesc()}</span>
                  {#if selected}<span class="hb-select__check" aria-hidden="true"></span>{/if}
                {/snippet}
              </Select.Item>
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>

    <div class="hb-field hb-field--stacked">
      <span class="hb-field__label">{t.live.preConnect.codecLabel()}</span>
      <Select.Root
        type="single"
        value={String(session.selectedCodec)}
        onValueChange={handleCodecChange}
      >
        <Select.Trigger class="hb-select__trigger" aria-label={t.live.preConnect.codecLabel()}>
          <span class="hb-select__value"
            >{codecOptions.find((o) => o.value === session.selectedCodec)?.label ?? ""}</span
          >
          <span class="hb-select__chevron" aria-hidden="true"></span>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content class={selectOverlayClass} sideOffset={6}>
            <Select.Viewport class="hb-select__viewport">
              {#each codecOptions as option (option.value)}
                <Select.Item class="hb-select__item" value={option.value} label={option.label}>
                  {#snippet children({ selected })}
                    <span>{option.label}</span>
                    {#if selected}
                      <span class="hb-select__check" aria-hidden="true"></span>
                    {/if}
                  {/snippet}
                </Select.Item>
              {/each}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
      <p class="publish-fields__codec-note">{t.live.preConnect.codecHevcNote()}</p>
    </div>

    <div class="hb-field hb-field--stacked">
      <span class="hb-field__label">{t.live.preConnect.bitrateLabel()}</span>
      <Select.Root
        type="single"
        value={String(session.selectedBitrateMbps)}
        onValueChange={handleBitrateChange}
      >
        <Select.Trigger class="hb-select__trigger" aria-label={t.live.preConnect.bitrateLabel()}>
          <span class="hb-select__value"
            >{bitrateOptions.find((o) => o.value === session.selectedBitrateMbps)?.label ?? ""}</span
          >
          <span class="hb-select__chevron" aria-hidden="true"></span>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content class={selectOverlayClass} sideOffset={6}>
            <Select.Viewport class="hb-select__viewport">
              {#each bitrateOptions as option (option.value)}
                <Select.Item class="hb-select__item" value={String(option.value)} label={option.label}>
                  {#snippet children({ selected })}
                    <span>{option.label}</span>
                    {#if selected}
                      <span class="hb-select__check" aria-hidden="true"></span>
                    {/if}
                  {/snippet}
                </Select.Item>
              {/each}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>

    <div class="hb-field hb-field--stacked">
      <span class="hb-field__label">{t.live.preConnect.framerateLabel()}</span>
      <Select.Root
        type="single"
        value={String(session.selectedFramerate)}
        onValueChange={handleFramerateChange}
      >
        <Select.Trigger class="hb-select__trigger" aria-label={t.live.preConnect.framerateLabel()}>
          <span class="hb-select__value"
            >{framerateOptions.find((o) => o.value === session.selectedFramerate)?.label ?? ""}</span
          >
          <span class="hb-select__chevron" aria-hidden="true"></span>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content class={selectOverlayClass} sideOffset={6}>
            <Select.Viewport class="hb-select__viewport">
              {#each framerateOptions as option (option.value)}
                <Select.Item class="hb-select__item" value={String(option.value)} label={option.label}>
                  {#snippet children({ selected })}
                    <span>{option.label}</span>
                    {#if selected}
                      <span class="hb-select__check" aria-hidden="true"></span>
                    {/if}
                  {/snippet}
                </Select.Item>
              {/each}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  {/if}
</div>

<style>
  .publish-stack {
    display: grid;
    gap: var(--space-3);
    width: 100%;
  }

  .publish-fields__codec-note {
    margin: 0;
    font-size: var(--step--2);
    line-height: 1.45;
    color: var(--foreground-muted);
    padding-inline-start: 2px;
  }
</style>
