<script lang="ts">
	import { Track } from "livekit-client";
	import { supportsScreenSharing } from "@livekit/components-core";
	import { Separator } from "bits-ui";
	import TrackToggle from "../components/controls/TrackToggle.svelte";
	import StartAudio from "../components/controls/StartAudio.svelte";
	import { useLocalParticipantPermissions } from "../hooks/useLocalParticipantPermissions.svelte";

	let {
		controls,
		variation,
		onDeviceError,
		class: className = '',
		micLabel = 'Microphone',
		cameraLabel = 'Camera',
		screenShareLabel = 'Share screen',
		startAudioLabel = 'Allow Audio',
	}: {
		controls?: {
			microphone?: boolean;
			camera?: boolean;
			screenShare?: boolean;
		};
		variation?: 'minimal' | 'verbose' | 'textOnly';
		saveUserChoices?: boolean;
		onDeviceError?: (error: { source: Track.Source; error: Error }) => void;
		class?: string;
		micLabel?: string;
		cameraLabel?: string;
		screenShareLabel?: string;
		startAudioLabel?: string;
		leaveLabel?: string;
	} = $props();

	const permissionsState = useLocalParticipantPermissions();
	const browserSupportsScreenSharing = supportsScreenSharing();

	const visibleControls = $derived.by(() => {
		const base = {
			microphone: controls?.microphone,
			camera: controls?.camera,
			screenShare: controls?.screenShare,
		};

		const permissions = permissionsState;
		if (!permissions) {
			return {
				camera: false,
				microphone: false,
				screenShare: false,
			};
		}

		const canPublishSource = (source: Track.Source) =>
			permissions.canPublish &&
			(permissions.canPublishSources.length === 0 ||
				permissions.canPublishSources.includes(
					source === Track.Source.Camera ? 1 : source === Track.Source.Microphone ? 2 : 3,
				));

		return {
			microphone: base.microphone ?? canPublishSource(Track.Source.Microphone),
			camera: base.camera ?? canPublishSource(Track.Source.Camera),
			screenShare: base.screenShare ?? canPublishSource(Track.Source.ScreenShare),
		};
	});

	const isTooLittleSpace = $state(false);
	const defaultVariation = $derived(isTooLittleSpace ? 'minimal' : 'verbose');
	const currentVariation = $derived(variation ?? defaultVariation);
	const showIcon = $derived(currentVariation === 'minimal' || currentVariation === 'verbose');
	const showText = $derived(currentVariation === 'textOnly' || currentVariation === 'verbose');
</script>

<div class="lk-control-bar {className}">
	{#if visibleControls.microphone}
		<div class="lk-button-group">
			<TrackToggle
				source={Track.Source.Microphone}
				{showIcon}
				onDeviceError={(error) => onDeviceError?.({ source: Track.Source.Microphone, error })}
			>
				{#if showText}{micLabel}{/if}
			</TrackToggle>
		</div>
		<Separator.Root orientation="vertical" decorative={true} class="lk-control-bar__separator" />
	{/if}
	{#if visibleControls.camera}
		<div class="lk-button-group">
			<TrackToggle
				source={Track.Source.Camera}
				{showIcon}
				onDeviceError={(error) => onDeviceError?.({ source: Track.Source.Camera, error })}
			>
				{#if showText}{cameraLabel}{/if}
			</TrackToggle>
		</div>
		<Separator.Root orientation="vertical" decorative={true} class="lk-control-bar__separator" />
	{/if}
	{#if visibleControls.screenShare && browserSupportsScreenSharing}
		<TrackToggle
			source={Track.Source.ScreenShare}
			{showIcon}
			onDeviceError={(error) => onDeviceError?.({ source: Track.Source.ScreenShare, error })}
		>
			{#if showText}{screenShareLabel}{/if}
		</TrackToggle>
		<Separator.Root orientation="vertical" decorative={true} class="lk-control-bar__separator" />
	{/if}
	<StartAudio label={startAudioLabel} />
</div>

<style>
	.lk-control-bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		padding: var(--space-3) var(--space-4);
		min-height: var(--lk-control-bar-height, 4.5rem);
		background: color-mix(in oklch, var(--card) 88%, transparent);
		border-block-start: var(--border);
	}

	.lk-control-bar__separator {
		height: 24px;
		align-self: center;
	}
</style>
