<script lang="ts">
  import { useI18n } from "$lib/i18n/runes";

  const { t } = useI18n();
  const year = new Date().getFullYear();
</script>

<footer class="landing-footer">
  <div class="l-shell landing-footer__grid">
    <div class="landing-footer__brand">
      <span class="landing-footer__logo">{t.site.name()}</span>
      <p class="landing-footer__tagline">{t.site.tagline()}</p>
    </div>

    <nav class="landing-footer__nav" aria-label="קישורים">
      <a href="/">דף הבית</a>
      <a href="/legal/terms">תנאי שימוש</a>
      <a href="/legal/privacy">פרטיות</a>
      <a href="/legal/cancellations">ביטולים</a>
      <a href="/legal/accessibility">נגישות</a>
      <a href="/legal/health">הצהרת בריאות</a>
    </nav>

    <div class="landing-footer__contact">
      <span class="landing-footer__contact-label">יצירת קשר</span>
      <a class="landing-footer__email" href="mailto:hello@anatome.co.il">hello@anatome.co.il</a>
    </div>
  </div>

  <div class="l-shell landing-footer__meta">
    <span>© {year} {t.site.name()}</span>
  </div>
</footer>
