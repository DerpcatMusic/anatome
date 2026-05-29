<script lang="ts">
  import AnatoMeLogo from "$lib/components/brand/AnatoMeLogo.svelte";
  import { useI18n } from "$lib/i18n/runes";

  const { t } = useI18n();
  const year = new Date().getFullYear();
</script>

<footer class="landing-footer">
  <div class="l-shell landing-footer__inner">
    <AnatoMeLogo class="landing-footer__logo" size={44} aria-label={t.site.name()} role="img" />

    <nav class="landing-footer__nav" aria-label="קישורים">
      <a href="/">דף הבית</a>
      <a href="/concept">רעיון Spine</a>
      <a href="/legal/terms">תנאי שימוש</a>
      <a href="/legal/privacy">פרטיות</a>
      <a href="/legal/cancellations">ביטולים</a>
      <a href="/legal/accessibility">נגישות</a>
      <a href="/legal/health">הצהרת בריאות</a>
    </nav>

    <span class="landing-footer__meta">© {year}</span>
  </div>
</footer>
