<script lang="ts">
	import { useI18n } from '$lib/i18n/runes';
	import './legal.css';

	let { children } = $props();

	const { t } = useI18n();
	const year = new Date().getFullYear();
</script>

<div class="legal-shell">
	{@render children()}

	<footer class="legal-footer">
		<nav class="legal-footer__nav" aria-label="מסמכים משפטיים">
			<a href="/legal/terms">תנאי שימוש</a>
			<a href="/legal/privacy">פרטיות</a>
			<a href="/legal/cancellations">ביטולים</a>
			<a href="/legal/accessibility">נגישות</a>
			<a href="/legal/health">הצהרת בריאות</a>
		</nav>
		<p class="legal-footer__meta">
			<span>© {year} {t.site.name()}</span>
			<a href="/">דף הבית</a>
		</p>
	</footer>
</div>
