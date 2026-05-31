<script lang="ts">
	let {
		class: className = '',
		src = '',
		alt = '',
	}: {
		class?: string;
		src?: string;
		alt?: string;
	} = $props();
</script>

<div class="lk-participant-placeholder {className}" aria-hidden="true">
	{#if src}
		<img class="lk-participant-placeholder__image" {src} {alt} />
	{:else}
		<span class="material-symbols-rounded lk-participant-placeholder__icon">person</span>
	{/if}
</div>

<style>
	:global(.lk-participant-placeholder) {
		display: grid;
		place-items: center;
		width: 100%;
		height: 100%;
		color: var(--foreground-muted);
		background: color-mix(in oklch, var(--foreground) 6%, var(--video-bg, #000));
	}

	.lk-participant-placeholder__icon {
		--icon-size: clamp(3rem, 18vw, 6rem);
		--icon-opsz: 48;
		opacity: 0.45;
	}

	.lk-participant-placeholder__image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
</style>
