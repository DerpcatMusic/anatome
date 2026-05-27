<script lang="ts">
	let {
		currentPage,
		totalPageCount,
	}: {
		currentPage: number;
		totalPageCount: number;
	} = $props();
</script>

{#if totalPageCount > 1}
	<div class="lk-pagination-indicator" role="group" aria-label="Page indicators">
		{#each { length: totalPageCount }, index}
			<span
				class="lk-pagination-indicator__dot"
				data-lk-active={index + 1 === currentPage}
				aria-current={index + 1 === currentPage ? 'true' : undefined}
				aria-label="Page {index + 1}"
			></span>
		{/each}
	</div>
{/if}

<style>
	.lk-pagination-indicator {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		position: absolute;
		inset-inline-start: 50%;
		inset-block-start: var(--space-3);
		transform: translateX(-50%);
		z-index: 10;
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-pill);
		background: var(--glass-bg);
		backdrop-filter: var(--glass-blur);
		border: var(--glass-border);
	}

	.lk-pagination-indicator__dot {
		display: block;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--foreground-muted);
		opacity: 0.4;
		transition: opacity var(--duration-base) var(--ease-out), transform var(--duration-base) var(--ease-out);
	}

	.lk-pagination-indicator__dot[data-lk-active='true'] {
		opacity: 1;
		transform: scale(1.25);
		background: var(--foreground);
	}

	@media (prefers-reduced-motion: reduce) {
		.lk-pagination-indicator__dot {
			transition: none;
		}
	}
</style>
