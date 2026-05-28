<script lang="ts">
  import AnatoMeLogo from "$lib/components/brand/AnatoMeLogo.svelte";
  import { useI18n } from "$lib/i18n/runes";
  const { t } = useI18n();
  const year = new Date().getFullYear();
</script>

<footer class="site-footer">
  <div class="footer-inner">
    <div class="footer-brand">
      <AnatoMeLogo class="footer-logo" size={36} aria-label={t.site.name()} role="img" />
      <span class="footer-tagline">{t.site.tagline()}</span>
    </div>

    <div class="footer-links">
      <a href="/">דף הבית</a>
      <a href="/legal/terms">תנאי שימוש</a>
      <a href="/legal/privacy">מדיניות פרטיות</a>
      <a href="/legal/cancellations">ביטולים</a>
      <a href="/legal/accessibility">נגישות</a>
    </div>

    <div class="footer-contact">
      <!-- FILL IN: אימייל אמיתי -->
      <a href="mailto:hello@anatome.co.il">hello@anatome.co.il</a>
      <!-- FILL IN: טלפון אמיתי -->
      <span dir="ltr">+972-50-000-0000</span>
    </div>
  </div>

  <div class="footer-legal">
    <span>© {year}</span>
    <a href="/legal/health">הצהרת בריאות</a>
    <a href="/legal/privacy">פרטיות</a>
  </div>
</footer>

<style>
  .site-footer {
    border-top: var(--border);
    background: var(--paper);
    padding: var(--space-7) clamp(24px, 5vw, 80px) var(--space-6);
  }

  .footer-inner {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: var(--space-6);
    margin-bottom: var(--space-7);
  }

  .footer-brand {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .footer-logo {
    flex-shrink: 0;
  }

  .footer-tagline {
    font-size: var(--step--1);
    color: var(--foreground-muted);
  }

  .footer-links {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: var(--space-4);
    align-items: center;
  }

  .footer-links a,
  .footer-legal a {
    font-size: var(--step-0);
    color: var(--ink);
    text-decoration: none;
    transition: color var(--duration-fast);
  }

  .footer-links a:hover,
  .footer-legal a:hover {
    color: var(--foreground-muted);
  }

  .footer-contact {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    font-size: var(--step-0);
  }

  .footer-contact a {
    color: var(--ink);
    text-decoration: none;
  }

  .footer-contact a:hover {
    text-decoration: underline;
  }

  .footer-contact span {
    color: var(--foreground-muted);
    font-family: var(--font-mono);
    font-size: var(--step--1);
  }

  .footer-legal {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-4);
    padding-top: var(--space-5);
    border-top: var(--border);
    font-size: var(--step--1);
    color: var(--foreground-muted);
  }

  .footer-legal a {
    font-size: inherit;
    color: inherit;
  }

  @media (max-width: 520px) {
    .footer-inner {
      flex-direction: column;
      gap: var(--space-5);
    }

    .footer-legal {
      flex-direction: column;
      gap: var(--space-2);
    }
  }
</style>
