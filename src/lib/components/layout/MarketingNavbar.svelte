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
				class="hb-button hb-button--brand hb-button--pill navbar__cta"
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
		position: sticky;
		top: 0;
		z-index: 50;
		height: 56px;
		direction: rtl;
		background: color-mix(in oklch, var(--paper) 88%, transparent);
		border-bottom: 1px solid transparent;
		backdrop-filter: blur(14px);
		-webkit-backdrop-filter: blur(14px);
		transition:
			background 0.2s ease,
			border-color 0.2s ease;
	}

	.navbar--scrolled {
		background: color-mix(in oklch, var(--paper) 94%, transparent);
		border-bottom-color: var(--line-light);
	}

	.navbar__inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		height: 100%;
		max-width: 68rem;
		margin-inline: auto;
		padding: 0 clamp(1.25rem, 5vw, 3.5rem);
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
	}
</style>
