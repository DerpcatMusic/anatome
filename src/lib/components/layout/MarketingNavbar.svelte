<script lang="ts">
	import { theme } from '$features/app/theme.svelte';

	function openAuth() {
		window.dispatchEvent(new CustomEvent('anatome:auth-open'));
	}
</script>

<nav class="navbar" aria-label="ניווט ראשי">
	<div class="navbar__inner">
		<a class="navbar__brand" href="/">
			<span class="navbar__logo">AnatoMe</span>
			<span class="navbar__divider">/</span>
			<span class="navbar__tagline">פילאטיס שיקומי</span>
		</a>

		<div class="navbar__actions">
			<button
				type="button"
				class="navbar__theme"
				onclick={() => theme.toggle()}
				title={theme.isDark ? 'מעבר למצב בהיר' : 'מעבר למצב כהה'}
				aria-label={theme.isDark ? 'מעבר למצב בהיר' : 'מעבר למצב כהה'}
			>
				<span class="navbar__theme-icon" aria-hidden="true">{theme.isDark ? '☀' : '☽'}</span>
			</button>

			<button class="hb-button hb-button--ink hb-button--sm" type="button" onclick={openAuth}>
				כניסה
			</button>
		</div>
	</div>
</nav>

<style>
	.navbar {
		position: sticky;
		top: 0;
		z-index: 50;
		height: 56px;
		background: var(--paper);
		border-bottom: var(--border);
	}

	.navbar__inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		height: 100%;
		padding: 0 clamp(16px, 3vw, 32px);
	}

	.navbar__brand {
		display: flex;
		align-items: baseline;
		gap: var(--space-2);
		text-decoration: none;
		color: var(--ink);
	}

	.navbar__logo {
		font-family: var(--font-display);
		font-weight: 400;
		font-size: var(--step-1);
	}

	.navbar__divider {
		color: var(--line-light);
		font-family: var(--font-mono);
		font-size: var(--step--1);
	}

	.navbar__tagline {
		font-size: var(--step-0);
		color: var(--muted);
		font-weight: 600;
	}

	.navbar__actions {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.navbar__theme {
		width: 36px;
		height: 36px;
		display: inline-grid;
		place-items: center;
		background: transparent;
		border: var(--border);
		color: var(--muted);
		cursor: pointer;
		padding: 0;
		transition:
			color var(--duration-fast),
			border-color var(--duration-fast),
			background var(--duration-fast);
	}

	.navbar__theme:hover {
		color: var(--ink);
		border-color: var(--secondary);
		background: var(--surface);
	}

	.navbar__theme-icon {
		font-size: 1.1rem;
		line-height: 1;
	}

	@media (max-width: 520px) {
		.navbar__tagline {
			display: none;
		}

		.navbar__inner {
			padding: var(--space-3) 16px;
		}
	}
</style>
