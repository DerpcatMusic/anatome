<script lang="ts">
  import { useI18n } from "$lib/i18n/runes";

  const { t } = useI18n();
</script>

<section class="l-panel l-section section--philosophy" aria-label="למה מהבית">
  <div class="l-shell philosophy">
    <p class="l-eyebrow l-in">{t.landing.philosophy.tag()}</p>
    <h2 class="section-title l-in">{t.landing.philosophy.headline()}</h2>
    <p class="philosophy__body l-in l-in--1">
      {t.landing.philosophy.bodyBefore()}<span class="philosophy__strike"
        >{t.landing.philosophy.bodyStrike()}</span
      >{t.landing.philosophy.bodyAfter()}
    </p>
  </div>
</section>
