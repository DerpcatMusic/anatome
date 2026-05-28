<script lang="ts">
  import { useI18n } from "$lib/i18n/runes";

  const { t } = useI18n();
</script>

<section class="l-panel l-section section--philosophy" aria-label="למה מהבית">
  <div class="l-shell philosophy">
    {#if t.landing.philosophy.headline()}
      <h2 class="section-title l-in">{t.landing.philosophy.headline()}</h2>
    {/if}
    <p class="philosophy__body l-in l-in--1">
      {t.landing.philosophy.bodyBefore()}{#if t.landing.philosophy.bodyStrike()}<span
          class="philosophy__strike">{t.landing.philosophy.bodyStrike()}</span
        >{/if}{t.landing.philosophy.bodyAfter()}
    </p>
  </div>
</section>
