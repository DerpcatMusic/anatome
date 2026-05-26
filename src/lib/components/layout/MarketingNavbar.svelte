<script lang="ts">
	import { browser } from '$app/environment';
	import { Button } from 'bits-ui';
	import { theme } from '$features/app/theme.svelte';
	import { useI18n } from '$lib/i18n/runes';

	const { t } = useI18n();

	let scrolled = $state(false);

	$effect(() => {
		if (!browser) return;

		const onScroll = () => {
			scrolled = window.scrollY > 12;
		};

		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});

	function openAuth() {
		window.dispatchEvent(new CustomEvent('anatome:auth-open'));
	}
</script>

<nav class="navbar" class:navbar--scrolled={scrolled} aria-label="ניווט ראשי">
	<div class="navbar__inner">
		<a class="navbar__brand" href="/">
			<span class="navbar__logo">{t.site.name()}</span>
		</a>

		<div class="navbar__actions">
			<a class="navbar__link" href="/library">{t.nav.library()}</a>

			<Button.Root
				class="hb-button hb-button--icon navbar__theme"
				type="button"
				onclick={() => theme.toggle()}
				title={theme.isDark ? 'מעבר למצב בהיר' : 'מעבר למצב כהה'}
				aria-label={theme.isDark ? 'מעבר למצב בהיר' : 'מעבר למצב כהה'}
			>
				<span class="navbar__theme-icon" aria-hidden="true">{theme.isDark ? '☀' : '☽'}</span>
			</Button.Root>

			<Button.Root
				class="hb-button hb-button--brand navbar__cta"
				type="button"
				onclick={openAuth}
			>
				{t.nav.login()}
			</Button.Root>
		</div>
	</div>
</nav>

<style>
	.navbar {
		position: fixed;
		inset-inline: 0;
		top: 0;
		z-index: 50;
		height: 56px;
		direction: rtl;
		background: var(--glass-bg);
		border-bottom: var(--glass-border);
		backdrop-filter: var(--glass-blur);
		-webkit-backdrop-filter: var(--glass-blur);
		transition:
			background var(--duration-base) ease,
			border-color var(--duration-base) ease,
			box-shadow var(--duration-base) ease;
	}

	.navbar--scrolled {
		background: var(--glass-strong-bg);
		border-bottom-color: var(--border-color);
		box-shadow: var(--shadow-ambient);
	}

	.navbar__inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		height: 100%;
		max-width: var(--l-max, 90rem);
		margin-inline: auto;
		padding: 0 clamp(1.25rem, 5vw, 5rem);
	}

	.navbar__brand {
		text-decoration: none;
		color: var(--ink);
	}

	.navbar__logo {
		font-family: var(--font-display);
		font-weight: 400;
		font-size: var(--step-1);
	}

	.navbar__actions {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.navbar__link {
		font-size: var(--step--1);
		font-weight: 700;
		color: var(--ink);
		text-decoration: none;
		padding: 0.35rem 0.5rem;
		border-radius: var(--radius-sm, 4px);
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
	}

	.navbar__theme-icon {
		font-size: 1rem;
		line-height: 1;
	}

	.navbar :global(.navbar__cta) {
		min-height: 40px;
		padding-inline: var(--space-5);
		font-weight: 800;
		border-radius: var(--radius-pill);
	}
</style>
