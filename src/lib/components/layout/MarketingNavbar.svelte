<script lang="ts">
	import { browser } from '$app/environment';
	import { Button } from 'bits-ui';
	import { theme } from '$features/app/theme.svelte';
	import { ScrollState } from 'runed';
	import { dashboardPathFromCachedRole } from '$lib/auth/post-sign-in';
	import { openAuthOverlay } from '$lib/auth/open-overlay';
	import { getCachedRole, initAuth } from '$lib/auth/session.svelte';
	import AnatoMeLogo from '$lib/components/brand/AnatoMeLogo.svelte';
	import { useI18n } from '$lib/i18n/runes';

	const { t } = useI18n();
	const auth = initAuth();
	const dashboardHref = $derived(dashboardPathFromCachedRole(getCachedRole()));

	const SCROLL_PILL_THRESHOLD = 32;

	const scrollState = new ScrollState({
		element: () => window,
		offset: { top: SCROLL_PILL_THRESHOLD },
		idle: 100,
	});

	let scrolled = $derived(scrollState.arrived.top);
</script>

<nav class="navbar" class:navbar--scrolled={scrolled} aria-label="ניווט ראשי">
	<div class="navbar__shell">
		<a class="navbar__brand" href="/" aria-label={t.site.name()}>
			<AnatoMeLogo class="navbar__logo" size={52} />
		</a>

		<div class="navbar__actions">
			<a class="navbar__link navbar__link--library" href="/library" aria-label={t.nav.library()}>
				<span class="navbar__link-label">{t.nav.library()}</span>
				<span class="material-symbols-rounded navbar__link-icon" aria-hidden="true">play_lesson</span>
			</a>

			<Button.Root
				class="hb-button hb-button--icon navbar__theme"
				type="button"
				onclick={() => theme.toggle()}
				title={theme.isDark ? 'מעבר למצב בהיר' : 'מעבר למצב כהה'}
				aria-label={theme.isDark ? 'מעבר למצב בהיר' : 'מעבר למצב כהה'}
			>
				<span class="navbar__theme-icon" aria-hidden="true">{theme.isDark ? '☀' : '☽'}</span>
			</Button.Root>

			{#if auth.isAuthenticated}
				<Button.Root
					class="hb-button hb-button--brand navbar__cta"
					type="button"
					onclick={() => {
						window.location.assign(dashboardHref);
					}}
				>
					{t.nav.dashboard()}
				</Button.Root>
			{:else}
				<Button.Root
					class="hb-button hb-button--brand navbar__cta"
					type="button"
					onclick={() => openAuthOverlay()}
				>
					{t.nav.login()}
				</Button.Root>
			{/if}
		</div>
	</div>
</nav>

<style>
	/* Positioning hook only — all visuals live on __shell so it can morph as one surface */
	.navbar {
		position: fixed;
		inset: 0 0 auto;
		z-index: 50;
		pointer-events: none;
		direction: rtl;
	}

	.navbar__shell {
		--navbar-ease: cubic-bezier(0.22, 1, 0.36, 1);
		--navbar-duration: 0.5s;

		pointer-events: auto;
		position: fixed;
		z-index: 50;
		top: 0;
		left: 0;
		right: 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		min-height: 56px;
		padding-inline: clamp(1.25rem, 5vw, 5rem);
		background: var(--glass-bg);
		backdrop-filter: var(--glass-blur);
		-webkit-backdrop-filter: var(--glass-blur);
		border: 1px solid transparent;
		border-bottom-color: color-mix(in oklch, var(--border-color) 55%, transparent);
		border-radius: 0;
		box-shadow: none;
		transition:
			top var(--navbar-duration) var(--navbar-ease),
			left var(--navbar-duration) var(--navbar-ease),
			right var(--navbar-duration) var(--navbar-ease),
			border-radius var(--navbar-duration) var(--navbar-ease),
			padding-inline var(--navbar-duration) var(--navbar-ease),
			min-height var(--navbar-duration) var(--navbar-ease),
			background var(--navbar-duration) ease,
			border-color var(--navbar-duration) ease,
			box-shadow var(--navbar-duration) var(--navbar-ease);
	}

	.navbar--scrolled .navbar__shell {
		top: var(--space-2);
		left: max(1rem, calc(50% - 19rem));
		right: max(1rem, calc(50% - 19rem));
		min-height: 48px;
		padding-inline: clamp(0.75rem, 3vw, 1.25rem);
		border-radius: var(--radius-pill);
		border-color: color-mix(in oklch, var(--border-color) 75%, transparent);
		background: color-mix(in oklch, var(--glass-strong-bg) 92%, var(--paper) 8%);
		box-shadow:
			0 1px 2px color-mix(in oklch, var(--ink) 5%, transparent),
			0 6px 16px -4px color-mix(in oklch, var(--ink) 10%, transparent),
			0 18px 40px -12px color-mix(in oklch, var(--ink) 16%, transparent);
	}

	.navbar__brand {
		text-decoration: none;
		color: var(--ink);
		flex-shrink: 0;
	}

	:global(.navbar__logo) {
		flex-shrink: 0;
	}

	.navbar__actions {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-width: 0;
	}

	.navbar__link {
		font-size: var(--step--1);
		font-weight: 700;
		color: var(--ink);
		text-decoration: none;
		padding: 0.35rem 0.5rem;
		border-radius: var(--radius-sm, 4px);
		white-space: nowrap;
	}

	.navbar__link:hover {
		color: var(--primary);
	}

	.navbar__link:focus-visible {
		outline: 2px solid var(--primary);
		outline-offset: 3px;
	}

	.navbar :global(.navbar__theme) {
		width: 36px;
		height: 36px;
		min-height: 36px;
		padding: 0;
		border-radius: 50%;
		flex-shrink: 0;
	}

	@media (max-width: 767px) {
		.navbar :global(.navbar__theme) {
			width: 44px;
			height: 44px;
			min-height: 44px;
		}

		.navbar :global(.navbar__cta) {
			min-height: 44px;
		}
	}

	.navbar__theme-icon {
		font-size: 1rem;
		line-height: 1;
	}

	.navbar :global(.navbar__cta) {
		min-height: 38px;
		padding-inline: var(--space-4);
		font-weight: 800;
		font-size: var(--step--1);
		border-radius: var(--radius-pill);
		flex-shrink: 0;
	}

	@media (max-width: 22rem) {
		.navbar__link--library .navbar__link-label {
			position: absolute;
			width: 1px;
			height: 1px;
			padding: 0;
			margin: -1px;
			overflow: hidden;
			clip: rect(0, 0, 0, 0);
			white-space: nowrap;
			border: 0;
		}

		.navbar__link--library {
			display: inline-grid;
			place-items: center;
			width: 44px;
			height: 44px;
			padding: 0;
			border-radius: 50%;
			background: color-mix(in oklch, var(--glass-bg) 60%, transparent);
		}

		.navbar__link-icon {
			display: inline;
			font-size: 1.25rem;
		}
	}

	.navbar__link-icon {
		display: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.navbar__shell {
			transition: none;
		}
	}
</style>
