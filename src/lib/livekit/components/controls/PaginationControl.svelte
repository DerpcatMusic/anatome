<script lang="ts">
	import { Button, Tooltip } from 'bits-ui';
	import { createInteractingObservable } from '@livekit/components-core';

	let {
		pagesContainer,
		currentPage,
		totalPageCount,
		nextPage,
		prevPage,
	}: {
		pagesContainer?: HTMLElement;
		currentPage: number;
		totalPageCount: number;
		nextPage: () => void;
		prevPage: () => void;
	} = $props();

	let interactive = $state(false);

	$effect(() => {
		if (!pagesContainer) return;

		const subscription = createInteractingObservable(pagesContainer, 2000).subscribe(
			(value) => {
				interactive = value;
			},
		);

		return () => {
			subscription.unsubscribe();
		};
	});
</script>

{#if totalPageCount > 1}
	<div class="lk-pagination-control" data-lk-user-interaction={interactive} role="group" aria-label="Pagination">
		<Tooltip.Root delayDuration={0}>
			<Tooltip.Trigger>
				{#snippet child({ props })}
					<Button.Root
						{...props}
						type="button"
						class="lk-pagination-control__button"
						onclick={prevPage}
						disabled={currentPage <= 1}
						aria-label="Previous page"
					>
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<polyline points="15 18 9 12 15 6" />
						</svg>
					</Button.Root>
				{/snippet}
			</Tooltip.Trigger>
			<Tooltip.Content side="top" sideOffset={4}>
				Previous page
			</Tooltip.Content>
		</Tooltip.Root>

		<span class="lk-pagination-control__count" aria-live="polite">
			{currentPage} of {totalPageCount}
		</span>

		<Tooltip.Root delayDuration={0}>
			<Tooltip.Trigger>
				{#snippet child({ props })}
					<Button.Root
						{...props}
						type="button"
						class="lk-pagination-control__button"
						onclick={nextPage}
						disabled={currentPage >= totalPageCount}
						aria-label="Next page"
					>
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<polyline points="9 18 15 12 9 6" />
						</svg>
					</Button.Root>
				{/snippet}
			</Tooltip.Trigger>
			<Tooltip.Content side="top" sideOffset={4}>
				Next page
			</Tooltip.Content>
		</Tooltip.Root>
	</div>
{/if}

<style>
	.lk-pagination-control {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-pill);
		background: var(--glass-bg);
		backdrop-filter: var(--glass-blur);
		border: var(--glass-border);
		position: absolute;
		inset-inline-start: 50%;
		inset-block-end: var(--space-3);
		transform: translateX(-50%);
		opacity: 0;
		transition: opacity var(--duration-base) var(--ease-out);
		pointer-events: none;
		z-index: 10;
	}

	.lk-pagination-control[data-lk-user-interaction='true'] {
		opacity: 1;
		pointer-events: auto;
	}

	:global(.lk-pagination-control__button) {
		display: inline-grid;
		place-items: center;
		width: 32px;
		height: 32px;
		padding: 0;
		border: none;
		border-radius: 50%;
		background: transparent;
		color: var(--foreground);
		cursor: pointer;
		transition: background var(--duration-fast);
	}

	:global(.lk-pagination-control__button:hover:not(:disabled)) {
		background: var(--muted);
	}

	:global(.lk-pagination-control__button:disabled) {
		opacity: 0.35;
		cursor: not-allowed;
	}

	.lk-pagination-control__count {
		font-size: var(--step--1);
		font-weight: 600;
		color: var(--foreground);
		min-width: 3ch;
		text-align: center;
		font-variant-numeric: tabular-nums;
	}

	@media (prefers-reduced-motion: reduce) {
		.lk-pagination-control {
			transition: none;
		}
	}
</style>
